<img src="./logo.png" width="400" alt="Bank of Asgard" />

# Instructions to use the application

1. Register an organization with Asgardeo.
2. Create [custom attributes](https://wso2.com/asgardeo/docs/guides/users/attributes/manage-attributes/) named `accountType` and `businessName`. Add the businessName, accountType and country attributes to the profile scope.
3. Create another [custom attribute](https://wso2.com/asgardeo/docs/guides/users/attributes/manage-attributes/) with the name `isFirstLogin`.
4. Enable the [Attribute Update Verification](https://wso2.com/asgardeo/docs/guides/users/attributes/user-attribute-change-verification/) for user email.
5. Create a SPA application.
  * Navigate to the "Shared Access" tab and share the application with all organizations.
  * Enable the `Code`, `Refresh Grant` and `Organization Switch` types. 
    * Note that the organization switch grant type is available only after shared access is enabled.
  * Add authorize redirect URL: `http://localhost:5173` and allowed origin: `http://localhost:5173`
  * Add the `mobile`, `country`, `email` and `accountType` to Profile scope navigating to `User Attributes & Stores` -> `Attributes` -> `OpenId Connect` -> `Scopes` -> `Profile` -> `New Attribute`.
  * Enable the following scopes and attributes within the client application created.  
    * `Profile - Country, First Name, Last Name, Username, Birth Date, AccountType, Business Name, Email; Email - email;  Phone - telephone; Address - country.`
6. Enable the following authenticators within the client application:
  * `Identifier First` - First Step
  * `Username and Password`, `Passkey` - Second Step
  * `Totp` and `Email OTP` - Third Step
7. Configure the conditional authentication script (Replace the `<NODE_SERVER_BASE_PATH>` with server URL) with the one found at conditional-auth-script.js.
8. Create a standard web application.
9. Navigate to the "Shared Access" tab and share the application with all organizations.
10. Enable the following grant types:
  `Code`, `Client Credentials`, `Organization Switch`
  Note that the organization switch grant type is available only after shared access is enabled.
11. Add the Authorized redirect URLs and allowed origins:
redirect url: `https://localhost:5003`, allowed origin: `https://localhost:5003 http://localhost:5173`

12. Enable API Authorization access for the following API resources:
  - Management APIs: 
    - SCIM2 Users API with the scopes:
      ```
      internal_user_mgt_create internal_user_mgt_list internal_user_mgt_view internal_user_mgt_delete internal_user_mgt_update
      ```
    - Organization Management API with the scopes:
      ```
      internal_organization_create internal_organization_view internal_organization_update internal_organization_delete
      ```
    - OAuth2 Introspection API
      ```
      internal_oauth2_introspect
      ```
  - Organization APIs:
    - SCIM2 Users API with the scopes:
      ```
      internal_org_user_mgt_update internal_org_user_mgt_delete internal_org_user_mgt_list internal_org_user_mgt_create 
      ```
    - SCIM2 Roles API with the scopes:
      ```
      internal_org_user_mgt_view internal_org_role_mgt_delete internal_org_role_mgt_create internal_org_role_mgt_update internal_org_role_mgt_view
      ```

13. Navigate to the Roles tab and create an application role named `Business Administrator` with the permissions for the SCIM2 Users and SCIM2 Roles organization APIs.
14. Navigate to Connections -> Passkey Setup -> Add the Trusted Origins: `http://localhost:5173` and enable `Allow Passkey usernameless authentication` option.

15. Configure [Onfido identity verification](https://wso2.com/asgardeo/docs/guides/identity-verification/add-identity-verification-with-onfido/) for your organization.

16. Create a copy of `app/public/config.example.js` inside the `app/public/` folder. And name it as `config.js`. Update the [config values](docs/config-properties.md) accordingly.
17. Navigate to `App_home/app` and run `npm i`.
18. From within the `App_home/app` directory, execute `npm start` to run the application.
19. Create a copy of `server/.env.example` inside the `server/` folder. And name it as `.env`. Update the according to the commented instructions.
20. Navigate to `App_home/server` and run `npm i`.
21. From within the `App_home/server` directory, execute `nodemon server.js` to run the server.
22. Test the application from registration of a personal and corporate account types.
