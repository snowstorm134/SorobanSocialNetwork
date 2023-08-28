import {useState} from "react";
import {useForm} from "react-hook-form";
import {Box, Button, Flex, FormControl, FormErrorMessage, Input, useToast} from "@chakra-ui/react";
import {IconSend} from "@tabler/icons-react";
import {PostType} from "@/pages/Posts/PostsList.tsx";
import * as contractSoroban from "social-contract";
import {useAccount} from "@/hooks";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import * as SorobanClient from "soroban-client";

type FormTypes = { message: string }

type CreatePostCommentProps = {
    postsCommentsCount: any,
    setPostsCommentCount: any,
    postInfo: PostType
}

const CreatePostComment = ({postInfo, postsCommentsCount, setPostsCommentCount}: CreatePostCommentProps) => {
    const toast = useToast()
    const account = useAccount()
    const {addPostComment} = usePostsStore()

    const [isLoadingCreateComment, setIsLoadingCreateComment] = useState(false)

    const {
        setValue,
        handleSubmit,
        register,
        formState: {errors},
    } = useForm<FormTypes>({
        defaultValues: {
            message: '',
        },
    })

    const onSubmitCreateComment = async (formData: FormTypes): Promise<void> => {
        if (account) {
            setIsLoadingCreateComment(true)
            try {
                let txAddComment = await contractSoroban.addComment({
                    address: account!.address,
                    post_nr: postInfo?.id,
                    text: formData?.message
                }, {fee: 1000, secondsToWait: 20, responseType: "full"})

                // @ts-ignore
                const result1 = SorobanClient.xdr.TransactionMeta.fromXDR(txAddComment?.resultMetaXdr, "base64");
                const scval1 = result1.v3().sorobanMeta()?.returnValue();
                // @ts-ignore
                const resDecod = SorobanClient?.scValToNative(scval1)
                addPostComment(postInfo?.id, {...resDecod, author: resDecod?.author?.toString()})
                setPostsCommentCount(postsCommentsCount + 1)

                toast({
                    title: 'Create Post Successfully!',
                    description: "",
                    position: 'bottom-right',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })

                setValue('message', '')
                setIsLoadingCreateComment(false)
            } catch (e) {
                console.log(e)
                setIsLoadingCreateComment(false)
                setValue('message', '')
                toast({
                    title: 'Create Comment Error!',
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

    return (
        <Box
            borderWidth="1px"
            rounded="lg"
            shadow="1px 1px 3px rgba(0,0,0,0.3)"
            p={1}
            mt="10px"
        >
            <form onSubmit={handleSubmit(onSubmitCreateComment)}>
                <Flex gap={3}>
                    <FormControl
                        isInvalid={!!errors.message}
                        mr="5%"
                    >
                        <Input
                            id="name" placeholder="Message"
                            {...register('message', {
                                required: 'This is required',
                                minLength: {value: 1, message: 'Minimum length should be 1'},
                            })}
                        />
                        <FormErrorMessage>
                            {errors.message && errors.message.message}
                        </FormErrorMessage>
                    </FormControl>
                    <Button isLoading={isLoadingCreateComment} type={'submit'}>
                        <IconSend/>
                    </Button>
                </Flex>
            </form>
        </Box>
    );
}

export default CreatePostComment;