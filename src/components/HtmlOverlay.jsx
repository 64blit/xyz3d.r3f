
export const HtmlOverlay = (props) =>
{

    return (
        <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-gray-800">

            <button className="absolute top-2 right-2 text-white w-[3.5rem] h-[2rem] bg-gray-500 rounded-sm border " onClick={() => { props.setDisplayPopup(false) }}>
                X
            </button>

            <iframe src={props.htmlContent} className="w-full h-full"></iframe>
        </div>
    );
};
