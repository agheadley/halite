import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {runtime: 'edge'};

let url = `${process.env.ATLAS_URL}/action/find`;

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
        "limit":50000,
        "projection": data.projection,
        "filter":data.filter
    };
   
    let response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});
    let res=await response.json();
    let results=res?.documents?.[0]?res.documents:[];
   
    //console.log(results);

    return json(results);
   
}