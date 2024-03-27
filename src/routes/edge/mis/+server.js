import { json } from '@sveltejs/kit';
import * as mis from '$lib/mis';
import * as util from '$lib/util';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {runtime: 'edge'};


let url = `${process.env.ATLAS_URL}/action/find`;

let headers= {
    'Access-Control-Request-Headers': '*',
    'Content-Type': 'application/json',
    'api-key':`${process.env.ATLAS}`
};



export async function POST({request}) {

    let today=util.getDate()

    const data = await request.json();
    
    //let update=data.update;
   
    /** @type {any} */
    let body = {
        "collection":'groups',
        "database":'halite',
        "dataSource":process.env.ATLAS_CLUSTER,
        "projection": {},
        "filter":{log:today}
    };
   
    url = `${process.env.ATLAS_URL}/action/findOne`;
    let response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    let res=await response.json();
    
    console.log(res && res.document ? res.document : `no groups records found for ${today}`);

    let isOld = res.document ? false : true;
    
    /** @type {any} */
    let groups=[];

    /** @type {any} */
    let contacts=[];



    if(isOld) {

        res=await fetch(`https://isams.oakham.rutland.sch.uk/api/batch/1.0/json.ashx?apiKey={${process.env.MIS_PEOPLE}}`);
        let x=await res.json();
       
        groups=mis.getGroupData(x,data.cfg);

        
        if(groups[0] && data.cfg.update.groups) {
            
            body = {
                "collection":'groups',
                "database":'halite',
                "dataSource":process.env.ATLAS_CLUSTER,
                "filter":{}
            };
            url = `${process.env.ATLAS_URL}/action/deleteMany`;
        
            response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
            res=await response.json();
            //console.log(res);
          
           

        
            body = {
                "collection":'groups',
                "database":'halite',
                "dataSource":process.env.ATLAS_CLUSTER,
                "documents":groups
            };
            url = `${process.env.ATLAS_URL}/action/insertMany`;
        
            response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
            res=await response.json();
            //console.log(res);
        }
         
        if(groups[0] && data.cfg.update.contacts) {
        
            contacts=mis.getContactData(x);
            //console.log(contacts);

            body = {
                "collection":'contacts',
                "database":'halite',
                "dataSource":process.env.ATLAS_CLUSTER,
                "filter":{}
            };
            url = `${process.env.ATLAS_URL}/action/deleteMany`;
        
            response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
            res=await response.json();
            //console.log(res);
           
           
        
            body = {
                "collection":'contacts',
                "database":'halite',
                "dataSource":process.env.ATLAS_CLUSTER,
                "documents":contacts
            };
            url = `${process.env.ATLAS_URL}/action/insertMany`;
        
            response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
            res=await response.json();
            
            
        }

        
    }

    /*
    body = {
        "collection":'log',
        "database":'occam',
        "dataSource":ATLAS_CLUSTER,
        "documents":log
    };
    url = `${ATLAS_URL}/action/insertMany`;

    response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    res=await response.json();
    //console.log('log insert',res);

    */

    

    return json({groups:groups});
};
