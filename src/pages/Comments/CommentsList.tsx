import {Stack} from "@chakra-ui/react";
import CommentCard from "./CommentCard.tsx";
import {PostCommentType} from "@/store/usePostsStore.tsx";

type CommentsListProps = {postId: number, postComments: PostCommentType[] | undefined}

const CommentsList = ({postId, postComments}: CommentsListProps) => {
    return (
        <Stack>
            {postComments?.map((item, index) =>
                <CommentCard key={item?.id} postId={postId} {...item}/>
            )}
        </Stack>
    );
}

export default CommentsList;