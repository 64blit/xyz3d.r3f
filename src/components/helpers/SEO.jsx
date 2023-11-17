import * as React from "react";
import { Helmet } from 'react-helmet-async';

export const Seo = (props) =>
{
    // If url is set to 'glitch-default', we use the hostname for the current page
    // Otherwise we use the value set in seo.json

    // url = { siteData.siteURL } author = { siteData.siteAuthor } title = { siteData.siteTitle } description = { siteData.description } icon = { siteData.siteIconURL } image = { siteData.siteIconURL } 
    const [ siteData, setSiteData ] = React.useState(null);

    React.useEffect(() =>
    {
        const xyzAPI = props.xyzAPI;
        if (!xyzAPI) return;

        const siteData = xyzAPI.getSiteData();
        if (!siteData) return;

        const url = siteData.siteURL ? siteData.siteURL : window.location.hostname;
        siteData.siteURL = url;
        setSiteData(siteData);

    }, [ props ]);


    // React Helmet manages the content of the page head such as meta tags
    // We use the async package https://github.com/staylor/react-helmet-async
    return <Helmet>
        <title>{siteData?.siteTitle}</title>

        <meta
            name="description"
            content={siteData?.siteDescription}
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={siteData?.siteURL} />
        <link rel="icon" type="image/x-icon" href={siteData?.siteURL} />
        <meta property="og:title" content={props.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={siteData?.siteURL} />
        <meta
            property="og:description"
            content={siteData?.siteDescription}
        />
        <meta
            property="og:image"
            content={siteData?.siteImage}
        />

        <meta name="twitter:card" content="summary" />
    </Helmet>
};
