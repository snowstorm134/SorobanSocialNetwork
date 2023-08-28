import {Box, Button, Flex, FormControl, FormErrorMessage, Image, Input, Stack, useToast} from "@chakra-ui/react";
import {useRef, useState} from "react";
import {IconSend, IconUpload} from "@tabler/icons-react";
import * as contractSoroban from "social-contract";
import {useForm} from "react-hook-form";
import {useAccount} from "@/hooks";
import {useStorageUpload} from "@thirdweb-dev/react";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import * as SorobanClient from "soroban-client";

type FormTypes = {
    text: string
}

const CreatePosts = () => {
    const toast = useToast()
    const account = useAccount()
    const {addPost} = usePostsStore()
    const {mutateAsync: upload} = useStorageUpload();

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState(null)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)

    const {
        setValue,
        handleSubmit,
        register,
        formState: {errors},
    } = useForm<FormTypes>({
        defaultValues: {
            text: '',
        },
    })

    const handleFileInputClick = () => {
        fileInputRef?.current?.click();
    }

    const handleFileChange = (event: any) => {
        setFile(event.target.files[0])
    }

    const clearFileInput = () => {
        if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null)
    }

    const onSubmit = async (formData: FormTypes): Promise<void> => {
        if (account) {
            setIsSubmitLoading(true)
            try {
                let uploadUrl = [' ']
                if (file) {
                    uploadUrl = await upload({
                        data: [file],
                        options: {uploadWithGatewayUrl: false, uploadWithoutDirectory: true},
                    });
                }

                let tx = await contractSoroban.addPost({
                    address: account?.address,
                    text: formData?.text,
                    content_uri: uploadUrl[0].slice(7)
                }, {fee: 1000, secondsToWait: 20, responseType: "full"})

                // @ts-ignore
                const result1 = SorobanClient.xdr.TransactionMeta.fromXDR(tx?.resultMetaXdr, "base64");
                const scval1 = result1.v3().sorobanMeta()?.returnValue();
                // @ts-ignore
                const resDecod = SorobanClient?.scValToNative(scval1)

                addPost({
                    ...resDecod,
                    author: resDecod?.author?.toString(),
                    isLiked: false,
                    likesCount: 0,
                    comments: []
                })

                toast({
                    title: 'Create Post Successfully!',
                    description: "",
                    position: 'bottom-right',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
                setValue('text', '')
                clearFileInput()
                setIsSubmitLoading(false)
            } catch (e) {
                console.log(e)
                setIsSubmitLoading(false)
                setValue('text', '')
                clearFileInput()
                toast({
                    title: 'Create Post Error!',
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box
                borderWidth="1px"
                rounded="lg"
                shadow="1px 1px 3px rgba(0,0,0,0.3)"
                maxWidth={800}
                m="10px auto"
                p={1}
            >
                <Flex gap={5}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                    <FormControl
                        isInvalid={!!errors.text}>
                        <Input
                            placeholder='Post description'
                            {...register('text', {
                                required: 'This is required',
                                minLength: {value: 1, message: 'Minimum length should be 1'},
                            })}
                        />
                        <FormErrorMessage>
                            {errors.text && errors.text.message}
                        </FormErrorMessage>
                    </FormControl>
                    <Flex gap={4}>
                        <Button onClick={handleFileInputClick} isLoading={isSubmitLoading} variant='solid'>
                            <IconUpload/>
                        </Button>
                        <Button type={'submit'} isLoading={isSubmitLoading} colorScheme='teal' variant='solid'>
                            <IconSend/>
                        </Button>
                    </Flex>
                </Flex>
                {file &&
                    <Stack gap={0} align={'flex-end'}>
                        <Box
                            w={'100%'}
                            borderWidth="1px"
                            rounded="lg"
                            shadow="1px 1px 3px rgba(0,0,0,0.3)"
                            maxWidth={800}
                            p={1}
                            m="10px auto"
                        >
                            <Image
                                h={'320px'}
                                w={'full'}
                                objectFit="cover"
                                alt="#"
                                src={URL.createObjectURL(file)}
                            />
                        </Box>
                        <Button disabled={isSubmitLoading} onClick={clearFileInput} colorScheme={'red'}>
                            Delete
                        </Button>
                    </Stack>
                }
            </Box>
        </form>
    );
}

export default CreatePosts