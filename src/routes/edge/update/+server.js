import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {runtime: 'edge'};

let url = `${process.env.ATLAS_URL}/action/updateMany`;

let headers= {
    'Access-Control-Request-Headers': '*',
    'Content-Type': 'application/json',
    'api-key':`${process.env.ATLAS}`
};


export async function POST({request}) {

    const data = await request.json();
    
    console.log('edge/read',data);
    /** @type {any} */
    let body = {
    
        "collection":data.collection,
        "database":'halite',
        "dataSource":process.env.ATLAS_CLUSTER,
        "filter":data.filter,
        "update":{$set:data.update}
    };
   
    let response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    let res=await response.json();
   


    return json(res);
   
}