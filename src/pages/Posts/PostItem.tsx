import {
    Avatar,
    Box,
    Button,
    Collapse,
    Flex,
    HStack,
    Image,
    Spinner,
    Stack,
    Text,
    useDisclosure,
    useToast,
    WrapItem
} from '@chakra-ui/react'
import CommentsList from "../Comments/CommentsList.tsx";
import {IconHeart, IconHeartFilled, IconMessage} from "@tabler/icons-react";
import CreatePostComment from "../Comments/CreatePostComment.tsx";
import PlaceholderImage from '@/assets/placeholder-image.png'
import * as contractSoroban from "social-contract";
import CopyButton from "@/components/CopyButton.tsx";
import {formatDate, formatShortAddress} from "@/utils/utils.tsx";
import {PostCommentType, usePostsStore} from "@/store/usePostsStore.tsx";
import {useAccount} from "@/hooks";
import {useEffect, useMemo, useState} from "react";
import {PostType} from "./PostsList.tsx";
import {IPFS_URL} from "@/utils/constants.tsx";

const MAX_PAGE_SIZE = 2

type PostItemProps = {
    postInfo: PostType | undefined
}

const PostItem = ({postInfo}: PostItemProps) => {
    const toast = useToast()
    const account = useAccount()
    const {posts, setPostComments, setIsLikedPost} = usePostsStore()

    const {isOpen, onToggle} = useDisclosure()

    const [isLoadingLike, setIsLoadingLike] = useState(false)
    const [isLoadingPostComments, setIsLoadingPostComments] = useState(false)
    const [postsCommentsCount, setPostsCommentCount] = useState(0)
    const [lastCommentIndex, setLastCommentLastIndex] = useState(0)

    const getPostsCount = async () => {
        let txPostCommentsCount = await contractSoroban.getPostCommentsCount({
            post_nr: postInfo!.id
        })
        setPostsCommentCount(txPostCommentsCount)
    }

    const handlerShowMore = async () => {
        const lastIndex = Number(lastCommentIndex) >= MAX_PAGE_SIZE ? (Number(lastCommentIndex) - MAX_PAGE_SIZE) : 0
        getPostComments({from: lastCommentIndex, to: lastIndex, initialState: postComments})
    }

    const getPostComments = async ({from, to, initialState}: { from: number, to: number, initialState: any }) => {
        setIsLoadingPostComments(true)
        const arrComments: PostCommentType[] = []
        if (postsCommentsCount > 0)
            try {
                for (let i = from; i > to; i--) {
                    let txPostCommentInfo = await contractSoroban.getPostCommentByNr({
                        post_nr: postInfo!.id,
                        comment_nr: i
                    })
                    arrComments.push(txPostCommentInfo)
                }
                setLastCommentLastIndex(to)
                setPostComments(postInfo?.id, [...initialState, ...arrComments])
                setIsLoadingPostComments(false)
            } catch (e) {
                setIsLoadingPostComments(false)
            }
    }

    const handlerLikePost = async (): Promise<void> => {
        if (account) {
            setIsLoadingLike(true)
            try {
                await contractSoroban.setOrRemoveLike({
                    post_nr: postInfo!.id!,
                    address: account?.address
                }, {fee: 1000, secondsToWait: 20, responseType: "full"})
                setIsLikedPost(postInfo?.id, !postInfo?.isLiked)
                setIsLoadingLike(false)
            } catch (e) {
                setIsLoadingLike(false)
                console.log(e)
                toast({
                    title: 'Like Post Error!',
                    description: "",
                    position: 'bottom-right',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
            }
        } else {
            toast({
                title: 'Connect wallet!',
                description: "",
                position: 'bottom-right',
                status: 'error',
                duration: 3000,
                isClosable: true,
                variant: 'subtle'
            })
        }
    }

    const postComments = useMemo(() => posts?.find(item => item?.id === postInfo?.id)?.comments, [posts, postInfo])

    useEffect(() => {
        getPostsCount()
    }, [postInfo]);

    useEffect(() => {
        if (postsCommentsCount > 0 && postComments?.length === 0) {
            const lastIndex = Number(postsCommentsCount) >= MAX_PAGE_SIZE ? (Number(postsCommentsCount) - MAX_PAGE_SIZE) : 0
            getPostComments({from: postsCommentsCount, to: lastIndex, initialState: []})
        }
    }, [postsCommentsCount]);

    if (!postInfo) return <></>

    return (
        <Box
            w="100%"
            borderWidth="1px"
            rounded="lg"
            shadow="1px 1px 3px rgba(0,0,0,0.3)"
            p={3}
        >
            <Box w="100%">
                <WrapItem>
                    <Box w="100%">
                        {postInfo?.content_uri !== null && postInfo?.content_uri !== undefined && postInfo?.content_uri !== '' &&
                            <Box
                                w="100%"
                                marginBottom={3} borderRadius="lg" overflow="hidden">
                                <Box
                                    w="100%"
                                    textDecoration="none" _hover={{textDecoration: 'none'}}>
                                    <Image
                                        transform="scale(1.0)"
                                        src={postInfo?.content_uri ? `${IPFS_URL}${postInfo?.content_uri}` : ''}
                                        alt="some text"
                                        objectFit="cover"
                                        width="100%"
                                        height={'300px'}
                                        transition="0.3s ease-in-out"
                                        _hover={{transform: 'scale(1.05)'}}
                                        fallbackSrc={PlaceholderImage}
                                    />
                                </Box>
                            </Box>
                        }
                        <Text noOfLines={3} as="p" fontSize="md" my="2">
                            {postInfo?.text} {postInfo?.id}
                        </Text>
                        <Flex gap={2} wrap={'wrap'} align={'center'} justify={'space-between'}>
                            <HStack marginTop="2" spacing="2" display="flex" alignItems="center">
                                <Avatar
                                    borderRadius="full"
                                    boxSize="40px"
                                    src={''}
                                />
                                <Stack gap={0}>
                                    <Text fontWeight="medium">
                                        <CopyButton
                                            value={postInfo!.author!}
                                            str={formatShortAddress(postInfo?.author)}
                                        />
                                    </Text>
                                    {postInfo?.create_time !== undefined &&
                                        <Text>{formatDate(new Date(parseInt(postInfo?.create_time?.toString()) * 1000))}</Text>
                                    }
                                </Stack>
                            </HStack>
                            <Flex align={'center'} gap={3}>
                                {(isLoadingPostComments || postsCommentsCount !== 0) &&
                                    <Button
                                        size={'sm'}
                                        isLoading={postComments?.length === 0 && isLoadingPostComments}
                                        onClick={onToggle}
                                        leftIcon={<IconMessage size={20}/>}
                                    >
                                        ({postsCommentsCount})
                                    </Button>
                                }
                                <Button
                                    size={'sm'}
                                    variant={postInfo?.isLiked ? 'solid' : "ghost"}
                                    onClick={handlerLikePost}
                                    isLoading={isLoadingLike}
                                    colorScheme={'red'}
                                    leftIcon={postInfo?.isLiked ? <IconHeartFilled size={20}/> : <IconHeart size={20}/>}
                                >
                                    ({postInfo.likesCount})
                                </Button>
                            </Flex>
                        </Flex>
                    </Box>
                </WrapItem>
            </Box>

            <CreatePostComment postsCommentsCount={postsCommentsCount} setPostsCommentCount={setPostsCommentCount}
                               postInfo={postInfo}/>

            <Collapse in={isOpen} animateOpacity>
                <Box
                    color='white'
                    mt='4'
                    rounded='md'
                    shadow='md'
                >
                    <CommentsList postId={postInfo?.id} postComments={postComments}/>
                </Box>

                {isLoadingPostComments && postComments?.length === 0
                    ? <Flex style={{marginBlock: 10}} justify={'center'} align={'center'}>
                        <Spinner size='lg'/>
                    </Flex>
                    : <>
                        <Stack>
                            {(postComments?.length !== 0) && (lastCommentIndex > 0) &&
                                <Flex style={{width: '100%'}} justify={'center'} align={'center'} mt={3}>
                                    <Button isLoading={isLoadingPostComments} onClick={handlerShowMore}>
                                        Load more
                                    </Button>
                                </Flex>
                            }
                        </Stack>
                    </>
                }
            </Collapse>
        </Box>
    )
}

export default PostItem
