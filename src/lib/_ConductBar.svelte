<script>

/** @type {number}*/
export let reward;
/** @type {number}*/
export let sanction;


const red='rgba(178,34,34,0.5)';
const green='rgba(34,139,34,0.5)';
const text='#333';
const blue='#1E90FF88';
const bg='#ddd';



</script>


<svg  width="7rem" height="2rem"xmlns="http://www.w3.org/2000/svg">
    <g >      
        <rect x={0} y={0} width={70} height={20} fill={bg}></rect>
        <rect x={0} y={0} width={reward} height={10} fill={green}></rect>
        <rect x={0} y={10} width={sanction} height={10} fill={red}></rect>  
    </g>
</svg>


<style>

</style>