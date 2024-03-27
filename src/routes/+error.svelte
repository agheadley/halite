<script>
    import { page } from '$app/stores';
    </script>
    
    
    <div class="row">
        <div class="col">
            <h4>Error</h4>
        </div>
    </div>
    
    <div class="row">
        <div class="col">
            <hr/>
        </div>
    </div>
    
    <div class="row">
        <div class="col">
            <blockquote>Oh no!</blockquote>
        </div>
    </div>
    
    
    
    <div class="row">
        <div class="col">
            <p>{$page.error && $page.error.message ? $page.error.message : ''}</p>
        </div>
    </div>
    
    <div class="row">
        <div class="col">
            <a class="button dark" href="/">Occam Home</a>
        </div>
    </div>