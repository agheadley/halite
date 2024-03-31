import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {runtime: 'edge'};




let headers= {
    'Access-Control-Request-Headers': '*',
    'Content-Type': 'application/json',
    'api-key':`${process.env.ATLAS}`
};




export async function POST({request}) {
    const data = await request.json();
  
    
    
    let body = {
        "collection":data.collection,
        "database":'halite',
        "dataSource":process.env.ATLAS_CLUSTER,
        "documents":data.documents
    };
    let url = `${process.env.ATLAS_URL}/action/insertMany`;

    let response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    let res=await response.json();
    console.log(res);

    return json(res?.insertedIds[0] ? res.insertedIds : []);

};