import {ReactNode} from "react";
import {Route, Routes} from "react-router-dom";
import PostPage from "@/pages/Posts/PostPage.tsx";
import EditProfile from "@/pages/Profile/EditProfile.tsx";
import Layout from "./Layout.tsx";
import {NotFoundPage} from "@/pages/Share/NotFoundPage.tsx";
import ProfileInfo from "@/pages/Profile/ProfileInfo.tsx";

const routes: {element: ReactNode, path: string}[] = [
    {element: <PostPage/>, path: '/'},
    {element: <PostPage/>, path: '/posts'},
    {element: <EditProfile/>, path: '/profile/edit'},
    {element: <ProfileInfo/>, path: '/profile/:id'},
    {element: <NotFoundPage/>, path: '/*'},
]

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                {routes?.map(r =>
                    <Route key={r.path} path={r.path} element={r.element}/>
                )}
            </Route>
        </Routes>
    );
}

export default AppRoutes;