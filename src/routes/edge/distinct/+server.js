import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
    runtime: 'edge'
};

let headers= {
    'Access-Control-Request-Headers': '*',
    'Content-Type': 'application/json',
    'api-key':`${process.env.ATLAS}`
};

let url = `${process.env.ATLAS_URL}/action/aggregate`;

export async function POST({ request }) {
   
    const data = await request.json();
    
    
    /** @type {any} */
    let distinct={};
    
    for(let item of data.aggregate) distinct[item]='$'+item;
    /** @type {any} */
    let aggregate=[{$match:data.match},{$group:{_id:distinct}}];
    //console.log(aggregate);
    
    let body = {"collection":data.collection,"database":'halite',"dataSource":process.env.ATLAS_CLUSTER,"pipeline":aggregate};
    let response = await fetch(url,{method: 'POST',headers: headers,body:JSON.stringify(body)});

    let res=await response.json();
    //console.log('/edge/distinct',res);
    let results=[];
    if(res.documents[0]) {
        for(let item of res.documents ) results.push({...item._id});
    }
   
    //console.log('/edge/distinct',results);
    return json(results);
}