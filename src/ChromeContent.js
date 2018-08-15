/*{
let s = document.createElement("script");
s.text = `
fetch("https://app.roll20.net/assets/app.js?1534264843")
.then(response => {

    console.log(response);

    response.blob().then(blob => {

        const url = window.URL.createObjectURL(blob);
        console.log(blob);

        let s = document.createElement("script");
        s.src = url;
        document.head.appendChild(s);
        
        
        console.log("content script done");
    })
})
`;
document.head.appendChild(s);
}
*/
