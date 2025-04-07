CREATE VIEW cap_user_view AS 
SELECT
  usm_users.id           AS User_ID,
  usm_users.user_login   AS User_Name,
  usm_users.activated    AS Rec_Act_Ind,
  NOW()                      AS Last_Updated_Dts,
  NOW()                      AS Rec_Created_Dts,
  usm_users.activated    AS User_Super_Admin_Ind,
  'ZTLiPW70rwTT/6VoFmw0zg==' AS User_Password_Encr,
  usm_users.user_email   AS User_Email_ID,
  usm_users.user_act_ind AS Is_First_Login
FROM usm_users
