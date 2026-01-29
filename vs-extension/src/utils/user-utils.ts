/**
 * User Information Utility Functions
 * 
 * Handles fetching, processing, and managing user information and access settings.
 */

import * as vscode from 'vscode';
import * as ExtensionInterfaces from '../interfaces/extension.interfaces';
import { STORAGE_KEYS, REQUEST_HEADERS } from '../constants/extension-constants';
import { makeSecureRequest } from '../constants/api-config';
import { getUserInfoApiUrl } from '../constants/api-config';
import * as ExtensionUtils from './extension-utils';
import { decryptUsingAES256, tryParseJSON, tryStringifyJSON } from './encryption-utils';

const logger = ExtensionUtils.createLogger('UserUtils');

/**
 * Fetches user information from the API and stores it
 * @param context - VS Code extension context
 * @param accessToken - JWT access token
 * @returns User information
 * @throws Error if authorization fails
 */
export async function getUserInfo(context: vscode.ExtensionContext, accessToken: string): Promise<ExtensionInterfaces.UserInfo> {
    logger.info('Fetching user information from API');

    try {
        const salt = context.globalState.get<string>(STORAGE_KEYS.ENC_DEFAULT, '');

        const response = await makeSecureRequest('GET', getUserInfoApiUrl(), context, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': REQUEST_HEADERS.ACCEPT,
                'content-type': REQUEST_HEADERS.CONTENT_TYPE,
                'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH
            },
            responseType: 'text'
        });

        const result = salt
            ? JSON.parse(await decryptUsingAES256(response.data, salt))
            : (typeof response.data === 'string' ? JSON.parse(response.data) : response.data);

        await Promise.all([
            context.globalState.update(STORAGE_KEYS.USER_INFO_DATA, result),
            context.globalState.update(STORAGE_KEYS.UPDATED_USER, false)
        ]);

        logger.info('User information fetched successfully');
        return result;
    } catch (error: any) {
        logger.error('Failed to fetch user information', error);

        // Check if this is a network/configuration error (Invalid URL, network issues)
        // vs an actual authorization error (401, 403)
        if (error.code === 'ERR_INVALID_URL' || 
            error.message?.includes('Invalid URL') ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNREFUSED') {
            // Re-throw network errors as-is so caller can handle them appropriately
            throw error;
        }

        // For HTTP errors, check the status code
        if (error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) {
                // Actual authorization error
                const authError: any = new Error('AUTHORIZATION_FAILED: You are not authorized to access this application. Please contact the administrator.');
                authError.isAuthorizationError = true;
                authError.originalError = error;
                throw authError;
            }
            // For other HTTP errors, re-throw as-is
            throw error;
        }

        // For unknown errors, treat as authorization error (backward compatibility)
        const authError: any = new Error('AUTHORIZATION_FAILED: You are not authorized to access this application. Please contact the administrator.');
        authError.isAuthorizationError = true;
        authError.originalError = error;
        throw authError;
    }
}

/**
 * Initializes user access settings with complete logic
 * @param context - VS Code extension context
 * @param userInfo - User information object
 * @param accessToken - JWT access token
 */
export async function initUserAccess(context: vscode.ExtensionContext, userInfo: ExtensionInterfaces.UserInfo, accessToken: string): Promise<void> {
    logger.info('Initializing user access settings');

    try {
        await Promise.all([
            context.globalState.update(STORAGE_KEYS.CURRENT_USER_INFO, userInfo),
            context.globalState.update(STORAGE_KEYS.USER_PORTFOLIOS, userInfo.porfolios || [])
        ]);

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            logger.warn('No portfolios found for user');
            return;
        }

        const portfolio = userInfo.porfolios[0];
        const dashconstant: ExtensionInterfaces.DashConstantQuery = {
            keys: portfolio.porfolioId.portfolioName + "default"
        };

        const currentProject = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
        const currentRole = context.globalState.get<any>(STORAGE_KEYS.ROLE);

        try {
            const dashConstants = await findAllDashConstant(
                context,
                currentProject || portfolio.projectWithRoles[0]?.projectId,
                currentRole || portfolio.projectWithRoles[0]?.roleId[0],
                dashconstant,
                accessToken
            );
            await processUserAccessWithConstants(context, userInfo, dashConstants, currentProject, currentRole);
        } catch (error) {
            logger.warn('Failed to fetch dashboard constants, using defaults', error);
        }

        if (portfolio.projectWithRoles && portfolio.projectWithRoles.length > 0) {
            logger.info('User access initialization completed');
        }
    } catch (error) {
        logger.error('Error initializing user access', error);
        await fallbackUserAccessInitialization(context, userInfo);
    }
}

/**
 * Processes user access with dashboard constants
 */
async function processUserAccessWithConstants(
    context: vscode.ExtensionContext,
    userInfo: ExtensionInterfaces.UserInfo,
    dashConstants: any,
    currentProject: any,
    currentRole: any
): Promise<void> {
    const portfolio = userInfo.porfolios![0];
    let res = (dashConstants.content || []).filter((item: any) =>
        item.keys === portfolio.porfolioId.portfolioName + "default"
    );

    const projectCheck = res.some((item: any) =>
        currentProject && currentProject.id === item.project_id.id
    );

    let projectindex = 0;
    let flag1 = 0;

    if (res.length > 0 && projectCheck) {
        const value = tryParseJSON(res[0].value);
        if (value?.defaultproject) {
            const defaultProj = portfolio.projectWithRoles.find((element: any, index: number) => {
                if (element.projectId.id === value.defaultproject) {
                    projectindex = index;
                    return true;
                }
                return false;
            });

            if (defaultProj) {
                await context.globalState.update(STORAGE_KEYS.PROJECT, defaultProj.projectId);
                flag1 = 1;
            }
        }
    }

    let index = determineProjectIndex(portfolio, context, flag1, projectindex);

    if (flag1 === 0) {
        await context.globalState.update(
            STORAGE_KEYS.PROJECT,
            currentProject || portfolio.projectWithRoles[index].projectId
        );
    }

    await processRoleSelection(context, userInfo, res, currentRole, flag1, projectindex, index);
    await context.globalState.update(STORAGE_KEYS.USER, userInfo.userId);

    const finalProject = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
    await context.globalState.update(
        STORAGE_KEYS.ORGANIZATION,
        currentProject?.name || portfolio.projectWithRoles[index].projectId.name
    );

    logger.info(`Project determined: ${finalProject?.name || 'Unknown'}`);
}

/**
 * Determines which project index to use
 */
function determineProjectIndex(portfolio: any, context: vscode.ExtensionContext, flag1: number, projectindex: number): number {
    if (flag1 === 1) { return projectindex; }

    let index = 0;
    if (portfolio.projectWithRoles.length > 1) {
        const autoUserProject = context.globalState.get<any>(STORAGE_KEYS.AUTO_USER_PROJECT);
        if (autoUserProject && portfolio.projectWithRoles[index].projectId.id === autoUserProject.id) {
            index = 1;
        }
    }
    return index;
}

/**
 * Processes role selection based on configuration
 */
async function processRoleSelection(
    context: vscode.ExtensionContext,
    userInfo: ExtensionInterfaces.UserInfo,
    res: any[],
    currentRole: any,
    flag1: number,
    projectindex: number,
    index: number
): Promise<void> {
    let flag = 0;
    const portfolio = userInfo.porfolios![0];

    if (res.length > 0) {
        const project = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
        const value = tryParseJSON(res[0].value);

        if (value) {
            const projectWithRoles = portfolio.projectWithRoles.find((element: any) =>
                element.projectId.id === project.id
            );

            if (projectWithRoles) {
                const clientRole = extractClientDetailsDefaultRole((projectWithRoles.projectId as any).clientDetails);

                if (clientRole) {
                    flag = trySetRoleFromClientDetails(context, projectWithRoles.roleId, clientRole);
                }

                if (flag === 0 && value.defaultRole) {
                    flag = trySetRoleFromDefault(context, projectWithRoles.roleId, value.defaultRole);
                }
            }
        }
    }

    if (flag === 0) {
        const roleIndex = flag1 === 1 ? projectindex : index;
        await context.globalState.update(
            STORAGE_KEYS.ROLE,
            currentRole || portfolio.projectWithRoles[roleIndex].roleId[0]
        );
    }
}

/**
 * Extracts default role from client details
 */
function extractClientDetailsDefaultRole(clientDetails: string | undefined): string | null {
    if (!clientDetails) { return null; }

    const details = tryParseJSON(clientDetails);
    if (!Array.isArray(details)) { return null; }

    const defaultRoleItem = details.find((item: any) => item.pointer?.trim() === "defaultRole");
    return defaultRoleItem?.value || null;
}

/**
 * Attempts to set role from client details
 */
function trySetRoleFromClientDetails(context: vscode.ExtensionContext, roles: any[], clientRole: string): number {
    const matchingRole = roles.find((element: any) => element.name.trim() === clientRole.trim());

    if (matchingRole) {
        const roleValue = tryStringifyJSON(matchingRole);
        if (roleValue) {
            context.globalState.update(STORAGE_KEYS.ROLE, matchingRole);
            return 1;
        }
    }
    return 0;
}

/**
 * Attempts to set role from default configuration
 */
function trySetRoleFromDefault(context: vscode.ExtensionContext, roles: any[], defaultRoleId: string): number {
    const matchingRole = roles.find((element: any) => element.id === defaultRoleId);

    if (matchingRole) {
        const roleValue = tryStringifyJSON(matchingRole);
        if (roleValue) {
            context.globalState.update(STORAGE_KEYS.ROLE, matchingRole);
            return 1;
        }
    }
    return 0;
}

/**
 * Fallback initialization when dashboard constants fail
 */
async function fallbackUserAccessInitialization(context: vscode.ExtensionContext, userInfo: ExtensionInterfaces.UserInfo): Promise<void> {
    try {
        if (!userInfo.porfolios || userInfo.porfolios.length === 0 ||
            !userInfo.porfolios[0].projectWithRoles || userInfo.porfolios[0].projectWithRoles.length === 0) {
            logger.warn('No valid portfolios or projects found for fallback initialization');
            return;
        }

        const portfolio = userInfo.porfolios[0];
        const firstProject = portfolio.projectWithRoles[0];

        await Promise.all([
            context.globalState.update(STORAGE_KEYS.USER, userInfo.userId),
            context.globalState.update(STORAGE_KEYS.PROJECT, firstProject.projectId),
            context.globalState.update(STORAGE_KEYS.ROLE, firstProject.roleId[0]),
            context.globalState.update(STORAGE_KEYS.ORGANIZATION, firstProject.projectId.name)
        ]);
    } catch (fallbackError) {
        logger.error('Fallback initialization also failed:', fallbackError);
    }
}

/**
 * Fetches dashboard constants from the API
 */
export async function findAllDashConstant(
    context: vscode.ExtensionContext,
    project: any,
    role: any,
    dashConstant: ExtensionInterfaces.DashConstantQuery,
    accessToken: string
): Promise<any> {
    logger.info('Fetching dashboard constants');

    try {
        const baseUrl = context.globalState.get<string>(STORAGE_KEYS.BASE_URL);

        if (!baseUrl) {
            logger.warn('Base URL not set');
            return { content: [] };
        }

        const apiUrl = `${baseUrl}/api/aip/service/v1/dashconstants/search`;

        const response = await makeSecureRequest('POST', apiUrl, context, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': REQUEST_HEADERS.ACCEPT,
                'content-type': REQUEST_HEADERS.CONTENT_TYPE,
                'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH,
                'project': project.id,
                'projectname': project.name,
                'roleid': role.id,
                'rolename': role.name
            },
            data: { keys: dashConstant.keys }
        });

        logger.info('Dashboard constants fetched successfully');
        return response.data;
    } catch (error) {
        logger.error('Error fetching dashboard constants', error);
        return { content: [] };
    }
}

/**
 * Clears all cached user data from storage
 */
export async function clearAllUserData(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Clearing all user data');

    const keysToCllear = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.PROJECT,
        STORAGE_KEYS.ORGANIZATION,
        STORAGE_KEYS.CURRENT_USER_INFO,
        STORAGE_KEYS.USER_INFO_DATA,
        STORAGE_KEYS.USER_PORTFOLIOS,
        STORAGE_KEYS.JWT_TOKEN,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.CURRENT_PROJECT,
        STORAGE_KEYS.CURRENT_PORTFOLIO,
        STORAGE_KEYS.UPDATED_USER,
        STORAGE_KEYS.RETURN_URL,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.DEFAULT_THEME,
        STORAGE_KEYS.FONT,
        STORAGE_KEYS.DASH_CONSTANTS,
        STORAGE_KEYS.USER_PREFERENCES,
        STORAGE_KEYS.SELECTED_ROLE,
        STORAGE_KEYS.SELECTED_PROJECT,
        STORAGE_KEYS.SELECTED_PORTFOLIO,
        STORAGE_KEYS.HAS_USED_LOGIN_SCREEN,
        STORAGE_KEYS.SELECTED_NETWORK
    ];

    await Promise.all(
        keysToCllear.map(key => context.globalState.update(key, undefined))
    );

    logger.info('All user data cleared');
}

/**
 * Clears user data but preserves network selection
 */
export async function clearUserDataExceptNetwork(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Clearing user data (preserving network selection)');

    const keysToCllear = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.PROJECT,
        STORAGE_KEYS.ORGANIZATION,
        STORAGE_KEYS.CURRENT_USER_INFO,
        STORAGE_KEYS.USER_INFO_DATA,
        STORAGE_KEYS.USER_PORTFOLIOS,
        STORAGE_KEYS.JWT_TOKEN,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.CURRENT_PROJECT,
        STORAGE_KEYS.CURRENT_PORTFOLIO,
        STORAGE_KEYS.UPDATED_USER,
        STORAGE_KEYS.RETURN_URL,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.DEFAULT_THEME,
        'font',
        'dashConstants',
        'userPreferences',
        'selectedRole',
        'selectedProject',
        'selectedPortfolio'
    ];

    await Promise.all(
        keysToCllear.map(key => context.globalState.update(key, undefined))
    );

    logger.info('User data cleared (network selection preserved)');
}
