import { PublicClientApplication } from "@azure/msal-browser";

/* localhost:3000 */
//let client_id='86ed050d-7a21-49ac-8e29-92b64dbcd97e';
//let url='http://localhost:3000/';

/* halite1.vercel.app (halite-testing app registration - portal.azure.com) */
let client_id='05169dc5-e18b-4193-8426-dde8fb7b9094';
let url='https://halite1.vercel.app/';

const msalConfig = {
    auth: {
        clientId: client_id,
        authority: 'https://login.microsoftonline.com/5ce437c5-6344-4124-b440-11729ea40b78',
        redirectUri:url,
        postLogoutRedirectUri:url
        
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

/* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/errors.md?scrlybrkr=dc0fd66d#interaction_in_progress */
export let login = async () =>{
    
    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();

    let accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        // No user signed in
        await msalInstance.loginRedirect();
        accounts = msalInstance.getAllAccounts();
    } 
    //console.log('accounts',accounts);

    let user={name:'',homeAccountId:'',tag:{teacher:false,admin:false,pupil:false}};

    if(accounts[0]) {
        user.homeAccountId=accounts[0].homeAccountId;
        let index=accounts[0].username.indexOf('@');
        user.name=index!==-1? accounts[0].username.substr(0,index).toUpperCase() : '';
    }

   
    return user;
     
};





 



/**
 * 
 * @param {string} homeAccountId 
 */    
export let logout = async (homeAccountId) => {
    
    let logoutRequest={account: msalInstance.getAccountByHomeId(homeAccountId),postLogoutRedirectUri: msalConfig.auth.redirectUri};
    msalInstance.logoutRedirect(logoutRequest);
       
};
