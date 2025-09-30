import { useEffect, useState, } from 'react';
import { environmentConfig } from "../util/environment-util";
import PropTypes from 'prop-types';
import { useAsgardeo, useOrganization } from '@asgardeo/react';
import { SwitchTokenContext } from './SwitchTokenContext';


const ContextSwitch = ({ organizationId, children, fallback = null, scopes = "openid profile internal_login" }) => {

  const asgardeo = useAsgardeo();
  const { myOrganizations, currentOrganization, switchOrganization } = useOrganization();
  const { isSignedIn, getAccessToken, exchangeToken } = asgardeo;
  const [ switchToken, setSwitchToken ] = useState("");
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);

  useEffect(() => {
      // if (currentOrganization.id != organizationId || !switchToken || switchToken == "") {
      //     handleTokenSwitch();
      // }
      if (!switchToken || switchToken == "") {
          handleTokenSwitch();
      }
  }, []);

  useEffect(() => {
    if (!switchToken || !refreshToken || !expiresIn) return;

    // Refresh 30 seconds before expiry
    const refreshTime = (expiresIn - 30) * 1000;
    const timer = setTimeout(() => {
      handleTokenRefresh();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [switchToken, refreshToken, expiresIn]);

  const handleTokenSwitch = async () => {
    if (!isSignedIn) {
        return;
    }
    const loggedInTokenResponse = await getAccessToken();
    const exchangeConfig = {
      attachToken: false,
      data: {
        client_id: `${environmentConfig.APP_CLIENT_ID}`,
        grant_type: 'organization_switch',
        // scope: 'openid internal_org_role_mgt_delete internal_org_role_mgt_create internal_org_role_mgt_update internal_org_role_mgt_view',
        scope: `${scopes}`,
        switching_organization: organizationId,
        token: loggedInTokenResponse,
      },
      id: 'organization-switch',
      returnsSession: false,
      signInRequired: true,
    };
    const tokenResponse = await exchangeToken(exchangeConfig);
    if ("access_token" in tokenResponse && typeof tokenResponse.access_token === "string") {
      setSwitchToken(tokenResponse.access_token);
    }
    if ("refresh_token" in tokenResponse && typeof tokenResponse.refresh_token === "string") {
      setRefreshToken(tokenResponse.refresh_token);
    }
    if ("expires_in" in tokenResponse) {
      setExpiresIn(tokenResponse.expires_in); // in seconds
    }
  };

  const handleTokenRefresh = async () => {
    const refreshConfig = {
      attachToken: false,
      data: {
        client_id: environmentConfig.APP_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      id: "organization-switch-refresh",
      returnsSession: false,
      signInRequired: true,
    };

    const tokenResponse = await exchangeToken(refreshConfig);

    if ("access_token" in tokenResponse && typeof tokenResponse.access_token === "string") {
      setSwitchToken(tokenResponse.access_token);
    }
    if ("refresh_token" in tokenResponse && typeof tokenResponse.refresh_token === "string") {
      setRefreshToken(tokenResponse.refresh_token);
    }
    if ("expires_in" in tokenResponse && typeof tokenResponse.expires_in === "string") {
      setExpiresIn(tokenResponse.expires_in); // in seconds
    }
  };



    if (!isSignedIn) {
      return <>
      <h1>aaaaaaa</h1>
      {fallback}
      </>;
    }

    if (!switchToken) {
      return <div>Loading...</div>;
    }

    // return <>{children}</>;
    return (
    <SwitchTokenContext.Provider value={switchToken}>
      {children}
    </SwitchTokenContext.Provider>
  );
}

ContextSwitch.propTypes = {
  organizationId: PropTypes.string.isRequired,
  children: PropTypes.element,
  fallback: PropTypes.element,
  scopes: PropTypes.string
};

export default ContextSwitch;
