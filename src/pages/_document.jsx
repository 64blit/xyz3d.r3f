import Document, { Html, Head, Main, NextScript } from 'next/document'
import dynamic from 'next/dynamic';

const r3fc = dynamic(import("@react-three/cannon"), { ssr: false });

export default class MyDocument extends Document
{
    static async getInitialProps(ctx)
    {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render()
    {
        return (
            <>
                <Html>
                    <Head >
                        <script type="module" >
                            {/* import reactThreeCannon from 'https://cdn.jsdelivr.net/npm/@react-three/cannon@6.6.0/+esm';
                            window.r3fc = r3fc; */}
                        </script>
                    </Head>
                    <body>
                        <Main />
                        <NextScript />
                    </body>
                </Html>
            </>
        )
    }
}
