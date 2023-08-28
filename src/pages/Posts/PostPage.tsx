import CreatePosts from "./CreatePosts.tsx";
import PostsList from "./PostsList.tsx";
import {useEffect, useState} from "react";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {useAccount} from "@/hooks";
import * as contractSoroban from "social-contract";

const PAGE_SIZE = 4

const PostPage = () => {
    const account = useAccount()
    const {posts, postsCount, setPosts, setPostCount} = usePostsStore()

    const [isLoadingPosts, setIsLoadingPosts] = useState(true)
    const [lastPostIndex, setLastPostIndex] = useState(0)

    const getPostsInfo = async ({ from, to, initialState }: { from: number, to: number, initialState: any }) => {
        setIsLoadingPosts(true);
        try {
            const arr = await Promise.all([...Array(from - to + 1)].map(async (_, index) => {
                const i = from - index;
                if(i > 0) {
                    try {
                        const [txPostInfo, txPostLikesCount, txPostIsLiked] = await Promise.all([
                            contractSoroban.getPost({ post_nr: i }),
                            contractSoroban.getPostLikes({ post_nr: i }),
                            account ? contractSoroban.getLikeStatus({ post_nr: i, address: account!.address }) : false
                        ]);
                        return { ...txPostInfo, likesCount: txPostLikesCount, isLiked: txPostIsLiked };
                    } catch (e) {
                        console.log(e);
                        return null;
                    }
                } else return null
            }));
            const filteredArr = arr.filter(item => item !== null);
            setLastPostIndex(to);
            setPosts([...initialState, ...filteredArr]);
            setIsLoadingPosts(false);
        } catch (e) {
            console.log(e);
        }
    };

    const handlerShowMore = async () => {
        const lastIndex = Number(lastPostIndex) >= PAGE_SIZE ? (Number(lastPostIndex) - PAGE_SIZE) : 0
        await getPostsInfo({from: lastPostIndex - 1, to: lastIndex, initialState: posts})
    }

    const getPostsCount = async (): Promise<void> => {
        setIsLoadingPosts(true)
        try {
            let tx = await contractSoroban.getPostsCount()
            setPostCount(tx)
            setIsLoadingPosts(false)
        } catch (e) {
            setIsLoadingPosts(false)
            console.log(e)
            throw e;
        }
    }

    useEffect(() => {
        setTimeout(() => {
            getPostsCount()
        }, 1000)
    }, [account])

    useEffect(() => {
        if (postsCount !== 0 && posts?.length === 0) {
            setPosts([])
            const lastIndex = Number(postsCount) >= PAGE_SIZE ? (Number(postsCount) - PAGE_SIZE) : 0
            getPostsInfo({from: postsCount, to: lastIndex + 1, initialState: []})
        }
    }, [postsCount]);

    useEffect(() => {
        setPosts([])
    }, []);

    return (
        <>
            <CreatePosts/>
            <PostsList lastPostIndex={lastPostIndex} handlerShowMore={handlerShowMore} isLoadingPosts={isLoadingPosts}/>
        </>
    );
}

export default PostPage;