<script>

    import {cohorts,groups,location,alert,config, pupils} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
    import { goto } from '$app/navigation';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import Chance from '$lib/_Chance.svelte';
    
    export let data;
    
    /** @type {any}*/
    let status = {
        table:[],
        assessment:{},
        edit:false,
        g:'',
        selected:false,
        tab:'group',    // 'group' || 'all'
        user:'',
        std:{A:'',B:''}
    
    };
    
    let toggleIntakeData=()=>{
        status.selected=status.selected?false:true;
        for(let g of status.table) {
            for(let p of g.pupil) p.selected=status.selected;
        }
    };
    
    onMount(async () => {
        $location='/assessments';
        console.log(`/assessments/edit mounted`);
        status.user=data.user.name;
         
    });
    
    </script>
    
    
    <div class="row">
        <h4>Manage</h4>
    </div>
    
    <style>
        td {
            padding:0.2rem;
        }
    </style>
    
    
    