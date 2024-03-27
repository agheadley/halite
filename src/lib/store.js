import { writable } from 'svelte/store';



export let alert = writable({msg:"",type:'success',ms:3000});

export let location=writable('');

export let config=writable({});

export let pupils=writable([]);
