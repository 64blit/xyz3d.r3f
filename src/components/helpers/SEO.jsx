import * as React from "react";
import { Helmet } from 'react-helmet-async';

export const Seo = (props) =>
{
    // If url is set to 'glitch-default', we use the hostname for the current page
    // Otherwise we use the value set in seo.json
    const url = props.url === 'webcrafter-default' ? window.location.hostname : props.url

    // React Helmet manages the content of the page head such as meta tags
    // We use the async package https://github.com/staylor/react-helmet-async
    return <Helmet>
        <title>{props.title}</title>

        <meta
            name="description"
            content={props.description}
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={url} />
        <link rel="icon" type="image/x-icon" href={url} />
        <meta property="og:title" content={props.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta
            property="og:description"
            content={props.description}
        />
        <meta
            property="og:image"
            content={props.image}
        />

        <meta name="twitter:card" content="summary" />
    </Helmet>
};
