<script>

    /** @type {string} */
    export let title;

    /** @type {string} */
    export let subtitle;

    
    </script>
    <div class="p">
      <div class="c">
        <div class="text">{title}</div>
        <div class="text">{subtitle}</div>
      </div>
  </div>
  <style>
   

  .c {
      position:absolute;
      top:6rem;
      width:10rem;
      height:4rem;
      border:0;
      overflow:hidden;
      font-size:1rem;
      transform: translate(-2rem,-3rem) rotate(-80deg);
      line-height:1rem;
  }

  

  .text {
    font-weight:bold;
  }

  .p {
    position:relative;
    width:3rem;
    height:10rem;
    border:0px solid #333;
    overflow:hidden;
  }

   
  </style>
