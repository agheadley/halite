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

    /** @type {any} */
    let newConduct=[];

    /** @type {any} */
    let conductData;

    res=await fetch(`https://isams.oakham.rutland.sch.uk/api/batch/1.0/json.ashx?apiKey={${process.env.MIS_PEOPLE}}`);
    let x=await res.json();
   
    groups=mis.getGroupData(x,data.cfg);


    if(isOld) {

       
        /* update groups */
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

        /* update contacts */
         
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


    /* contacts checking and update */

    let now=new Date();
    let currentYear=now.getFullYear();
    let currentMonth=now.getMonth()+1;
    console.log('before',currentMonth,currentYear);

    if(currentMonth<data.cfg.rollover.month) currentYear-=1;
    console.log('after',currentMonth,currentYear,data.cfg.rollover);

    /* testing */
    currentMonth=9;
    currentYear=2023;

    body = {
        "collection":'conduct',
        "database":'halite',
        "dataSource":process.env.ATLAS_CLUSTER,
        "projection": {},
        "filter":{log:today}
    };
   
    url = `${process.env.ATLAS_URL}/action/findOne`;
    response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    res=await response.json();
    
    console.log(res && res.document ? res.document : `no conduct records found for ${today}`);

    isOld = res.document ? false : true;
    
    console.log(isOld);

    if(isOld) {

        let filter=`<?xml version="1.0" encoding="utf-8" ?>
        <Filters>
                <RewardsAndConduct>
                        <Records startDate="${currentYear}-${String(currentMonth).padStart(2,'0')}-01" endDate="${today}" />
                </RewardsAndConduct>
        </Filters>`;
        if (filter.charCodeAt(0) === 0xFEFF) filter = filter.slice(1); // Remove the BOM
  
    /** @type {any} */
    let res=await fetch(`https://isams.oakham.rutland.sch.uk/api/batch/1.0/json.ashx?apiKey={${process.env.MIS_RS}}`,{method:"post",headers:{'Accept': 'application/xml','Content-Type': 'application/json'},body:filter});
    conductData=await res.json();


    console.log(conductData,filter);

     /** @type {any} */
     body = {
        "collection":'conduct',
        "database":'halite',
        "dataSource":process.env.ATLAS_CLUSTER,
        "limit":50000,
        "projection": {},
        "filter":{}
    };

    url = `${process.env.ATLAS_URL}/action/find`;
    response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    res=await response.json();
    let existingConduct= res.documents?res.documents:[];
   
    
    newConduct=mis.getConductData(conductData,data.cfg,groups,existingConduct);

        if(newConduct[0] && data.cfg.update.conduct) {
            body = {
                "collection":'conduct',
                "database":'halite',
                "dataSource":process.env.ATLAS_CLUSTER,
                "filter":{}
            };
            url = `${process.env.ATLAS_URL}/action/deleteMany`;
        
            response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
            res=await response.json();
           
            body = {
                "collection":'conduct',
                "database":'halite',
                "dataSource":process.env.ATLAS_CLUSTER,
                "documents":newConduct
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

    

    return json({});
};
