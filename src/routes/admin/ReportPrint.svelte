<script>
import { onMount } from 'svelte';
import * as file from '$lib/file';
import * as util from '$lib/util';
import {alert,config,groups,teachers,pupils} from '$lib/store';
import Modal from '$lib/_Modal.svelte';

 /** @type {any}*/
 export let status;

onMount(async () => {
    console.log('/admin ReportPrint.svelte');
    console.log(status);

   
});

</script>


<h4>Download Report Data for PDF generation</h4>
<style>

</style>