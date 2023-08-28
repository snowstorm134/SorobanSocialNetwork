import {Fragment} from "react";
import {Alert, AlertIcon, AlertTitle, Button, Divider, Flex, Spinner, Stack} from "@chakra-ui/react";
import {Post} from "social-contract";
import {PostCommentType, usePostsStore} from "@/store/usePostsStore.tsx";
import PostItem from "./PostItem.tsx";

export type PostType = Post & {
    likesCount: number,
    comments: PostCommentType[],
    isLiked: boolean,
}

type PostsListProps = {
    isLoadingPosts: boolean, lastPostIndex: number,
    handlerShowMore: () => void
}

const PostsList = ({isLoadingPosts, handlerShowMore, lastPostIndex}: PostsListProps) => {
    const {posts} = usePostsStore()

    return (
        <Stack style={{marginBottom: 20}}>
            {isLoadingPosts && (posts?.length === 0 ) &&
                <Flex justify={'center'} align={'center'}>
                    <Spinner size='lg'/>
                </Flex>
            }

            {posts?.length !== 0 &&
                posts.map((item, index) =>
                    <Fragment key={item?.id}>
                        <PostItem  postInfo={item}/>
                        {index !== posts.length - 1 &&
                            <Divider my={5}/>
                        }
                    </Fragment>
                )
            }

            {posts?.length === 0 && !isLoadingPosts &&
                <Alert status='info'>
                    <Stack>
                        <Flex>
                            <AlertIcon/>
                            <AlertTitle>No posts</AlertTitle>
                        </Flex>
                    </Stack>.
                </Alert>
            }
            {(posts?.length !== 0) && (lastPostIndex > 0) &&
                <Button isLoading={isLoadingPosts} onClick={handlerShowMore}>
                    Show more
                </Button>
            }
        </Stack>
    );
}

export default PostsList;