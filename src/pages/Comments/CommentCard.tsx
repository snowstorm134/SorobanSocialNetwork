import {Avatar, Box, Card, CardBody, CardHeader, Flex, Text} from "@chakra-ui/react";
import {PostCommentType} from "@/store/usePostsStore.tsx";
import {formatDate, formatShortAddress} from "@/utils/utils.tsx";
import CopyButton from "@/components/CopyButton.tsx";
 
type CommentCardProps = PostCommentType & { postId: number }

const CommentCard = ({postId, id, text, create_time, author}: CommentCardProps) => {
    return (
        <Card key={'outline'} variant={'outline'}>
            <CardHeader style={{marginTop: 0, padding: 10, paddingBottom: 0}}>
                <Flex gap='4'>
                    <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
                        <Avatar size={'sm'} src={''}/>
                        <Box>
                            <CopyButton value={author} str={formatShortAddress(author)}/>
                            <Text>
                                {formatDate(new Date(parseInt(create_time?.toString()) * 1000))}
                            </Text>
                        </Box>
                    </Flex>
                </Flex>
            </CardHeader>
            <CardBody style={{marginTop: 0, paddingTop: 0, padding: 10}}>
                <Text>{text}</Text>
            </CardBody>
        </Card>
    );
}

export default CommentCard;