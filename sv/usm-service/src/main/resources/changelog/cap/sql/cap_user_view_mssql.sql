CREATE VIEW cap_user_view AS 
SELECT        id AS User_ID, user_login AS User_Name, activated AS Rec_Act_Ind, GETDATE() AS Last_Updated_Dts, GETDATE() AS Rec_Created_Dts, activated AS User_Super_Admin_Ind, 
                         N'ZTLiPW70rwTT/6VoFmw0zg==' AS User_Password_Encr, user_email AS User_Email_ID, user_act_ind AS Is_First_Login
FROM            dbo.usm_users
