export let start =`
<!DOCTYPE html>
<html lang='en'>
<head>
<title>Halite</title>
<meta charset='utf-8'>
<link rel="stylesheet" href="https://unpkg.com/chota@latest">
<style>
.report-information {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.statement-txt {
    background: rgba(51,51,51,0.00);
    padding:0.2rem;
    border-radius:0.5rem;
    
}

.report-txt {
    background: rgba(51,51,51,0.1);
    padding:0.2rem;
    border-radius:0.5rem;
    
}



.report-cell {
width:3rem;
text-align: center;
overflow:hidden;
padding:0.1rem;

}

.bold {
    font-weight:600;

}

.small {
    font-size:1.2rem;
}
</style>
</head>
<body>
<div class="container">
`;


export let end = `
</div>
</body>
</html>
`;
