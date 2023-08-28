import {ErrorBoundary} from "react-error-boundary";
import ErrorPage from "@/pages/Share/ErrorPage.tsx";
import {ThirdwebProvider} from "@thirdweb-dev/react";
import AppRoutes from "./AppRoutes.tsx";
import {BrowserRouter} from "react-router-dom";
import {ChakraProvider} from "@chakra-ui/react";

const AppProviders = () => {
    return <BrowserRouter>
        <ThirdwebProvider clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}>
            <ChakraProvider>
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <AppRoutes/>
                </ErrorBoundary>
            </ChakraProvider>
        </ThirdwebProvider>
    </BrowserRouter>
}

export default AppProviders