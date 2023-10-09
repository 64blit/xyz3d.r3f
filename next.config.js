/**
 * @type {import('next').NextConfig}
 */

const webpack = require('webpack');

const nextConfig = {
    output: 'export',
    // Optional: Change the output directory `out` -> `dist`
    // distDir: 'dist',

    experimental: {},
    webpack: (config, { isServer }) =>
    {
        // Add the module you want to exclude to the externals list
        config.externals = {
            // 'critters': 'critters',
            // '@react-three/cannon': 'window.r3fc',
        };

        // config.module.rules.push({
        //     test: /\.html$/i,
        //     loader: "html-loader",
        // });

        // if (!isServer)
        // {
        //     // Replace @react-three/cannon with CDN link
        //     config.plugins.push(
        //         new webpack.NormalModuleReplacementPlugin(
        //             /@react-three\/cannon/,
        //             resource =>
        //             {
        //                 resource.request = resource.request.replace(
        //                     /@react-three\/cannon/,
        //                     'https://cdn.jsdelivr.net/npm/@react-three/cannon@6.6.0/+esm'
        //                 );
        //             }
        //         )
        //     );
        // }

        return config;
    },

}

module.exports = nextConfig
