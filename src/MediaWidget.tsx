import {DOM} from "./utils/DOM";

const MediaWidget = ({url, description}) => {
    return (
        <div>
            {url.endsWith(".webm")
                ? <video autoplay loop style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                    display: "block",
                    margin: "auto"
                }} src={url}></video>
                : <img style={{display: "block", margin: "auto"}} src={url} alt={url}/>
            }


            <p style={{textAlign: "center"}}>{description}</p>

        </div>
    );
};

export default MediaWidget;
