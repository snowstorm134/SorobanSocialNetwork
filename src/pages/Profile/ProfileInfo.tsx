import {
    Alert,
    AlertIcon,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Image,
    Spinner,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    useToast
} from '@chakra-ui/react'
import PostsList from "../Posts/PostsList.tsx";
import {useAccount} from "@/hooks";
import * as contractSoroban from "social-contract";
import {UserInfo} from "social-contract";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from 'react'
import {EditIcon} from "@chakra-ui/icons";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {formatShortAddress} from "@/utils/utils.tsx";
import FollowersList from '../Followers/FollowersList.tsx';
import {IconCheck} from "@tabler/icons-react";
import {IPFS_URL} from "@/utils/constants.tsx";
import CopyButton from "@/components/CopyButton.tsx";

type ProfileInfoProps = UserInfo & {
    followersCount: number
}

const PAGE_SIZE = 4

const ProfileInfo = () => {
    const toast = useToast()
    const account = useAccount()
    const {pathname} = useLocation()
    const navigate = useNavigate()
    const {id} = useParams<{ id: any }>()

    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [profile, setProfile] = useState<ProfileInfoProps | null>(null)
    const {posts, postsCount, setPosts, setPostCount} = usePostsStore()
    const [isLoadingPosts, setIsLoadingPosts] = useState(false)
    const [profileFollowers, setProfileFollowers] = useState<Array<UserInfo & { address: string }> | null>(null)
    const [isLoadingFetchFollowers, setIsLoadingFetchFollowers] = useState(false)
    const [lastPostIndex, setLastPostIndex] = useState(0)
    const [isFollowed, setIsFollowed] = useState(false)
    const [isLoadingFollowStatus, setIsLoadingFollowStatus] = useState(false)
    const [isLoadingFollow, setIsLoadingFollow] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [totalPosts, setTotalPosts] = useState(0)

    const getFollowStatus = async () => {
        setIsLoadingFollowStatus(true)
        try {
            let txUserFollowStatus = await contractSoroban.getFollowStatus({
                address: id,
                follower: account!.address
            })
            setIsFollowed(txUserFollowStatus)
            setIsLoadingFollowStatus(false)
        } catch (e) {
            console.log(e)
            setIsLoadingFollowStatus(false)
        }
    }

    const getFollowers = async () => {
        setIsLoadingFetchFollowers(true)
        try {
            let txFollowersCount = await contractSoroban.getUserFollowersCount({
                address: id
            })
            const arr = []
            for (let i = 1; i < txFollowersCount + 1; i++) {
                try {
                    let txFollowerInfo = await contractSoroban.getUserFollowerByNr({
                        address: id,
                        nr: i
                    })
                    let txFollowerUserInfo = await contractSoroban.getUserInfo({
                        address: txFollowerInfo,
                    })
                    arr.push({...txFollowerUserInfo, address: txFollowerInfo})
                } catch (e) {
                    console.log(e)
                }
            }
            setProfileFollowers(arr)
            setIsLoadingFetchFollowers(false)
        } catch (e) {
            console.log(e)
            setIsLoadingFetchFollowers(false)
        }
    }

    const getUserInfo = async () => {
        setIsLoadingProfile(true)
        try {
            let txUserInfo = await contractSoroban.getUserInfo({
                address: id
            })
            let txUserFollowersCount = await contractSoroban.getUserFollowersCount({
                address: id
            })
            getFollowers()
            setProfile({...txUserInfo, followersCount: txUserFollowersCount})
            setIsLoadingProfile(false)
        } catch (e) {
            console.log(e)

            if (e?.toString()?.includes('Unsupported address type')) {
                setErrorMessage('Unsupported address type')
            }

            setIsLoadingProfile(false)
        }
    }

    const getPostsInfo = async ({from, to, initialState}: { from: number, to: number, initialState: any }) => {
        setIsLoadingPosts(true)
        try {
            const arr = []
            for (let i = from; i > to; i--) {
                let txPostInfo = await contractSoroban.getPostOfUserByNr({
                    address: id,
                    nr: i
                })

                let txPostLikesCount = await contractSoroban.getPostLikes({
                    post_nr: txPostInfo?.id
                })

                let txPostIsLiked = false
                if (account) {
                    txPostIsLiked = await contractSoroban.getLikeStatus({
                        post_nr: txPostInfo?.id,
                        address: account!.address
                    })
                }
                arr.push({...txPostInfo, likesCount: txPostLikesCount, isLiked: txPostIsLiked})
            }
            setLastPostIndex(to);
            setPosts([...initialState, ...arr])
            setIsLoadingPosts(false)
        } catch (e) {
            console.log(e)
            setIsLoadingPosts(false)
        }
    }

    const getPostsCount = async (): Promise<void> => {
        setIsLoadingPosts(true)
        try {
            let tx = await contractSoroban.getUserPostCount({
                address: id
            })
            setTotalPosts(tx)
            setPostCount(tx)
            setIsLoadingPosts(false)
        } catch (e) {
            setIsLoadingPosts(false)
            console.log(e)
        }
    }

    const handlerShowMore = async () => {
        const lastIndex = Number(lastPostIndex) >= PAGE_SIZE ? (Number(lastPostIndex) - PAGE_SIZE) : 0
        await getPostsInfo({from: lastPostIndex, to: lastIndex, initialState: posts})
    }

    const handlerFollow = async (): Promise<void> => {
        if (account) {
            if (!isFollowed) {
                setIsLoadingFollow(true)
                try {
                    await contractSoroban.followUser({
                        address: id,
                        follower: account?.address
                    }, {fee: 1000, secondsToWait: 20, responseType: "full"})
                    setIsFollowed(!isFollowed)
                    setIsLoadingFollow(false)
                } catch (e) {
                    console.log(e)
                    setIsLoadingFollow(false)
                    toast({
                        title: 'Follow User Error!',
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
                    title: 'You already followed!',
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

    useEffect(() => {
        if (account && id !== null) {
            getFollowStatus()
        }
    }, [account]);

    useEffect(() => {
        if (id !== undefined)
            setTimeout(() => {
                getPostsCount()
            }, 1000)
    }, [id])

    useEffect(() => {
        setErrorMessage('')
        setPosts([])
    }, []);

    useEffect(() => {
        setErrorMessage('')
        setPosts([])
    }, [pathname]);

    useEffect(() => {
        if (totalPosts !== 0) {
            const lastIndex = Number(totalPosts) >= PAGE_SIZE ? (Number(totalPosts) - PAGE_SIZE) : 0
            getPostsInfo({from: totalPosts, to: lastIndex, initialState: []})
        }
    }, [totalPosts]);

    useEffect(() => {
        if (id !== undefined) {
            getUserInfo()
        }
    }, [id]);

    if (errorMessage !== '')
        return <Alert mt={30} status='error'>
            <AlertIcon/>
            <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>

    return (
        <>
            {isLoadingProfile &&
                <Flex style={{marginBlock: 10}} justify={'center'} align={'center'}>
                    <Spinner size='lg'/>
                </Flex>
            }
            {!isLoadingProfile && profile &&
                <Stack>
                    <Center py={6}>
                        <Box
                            w={'full'}
                            bg={useColorModeValue('white', 'gray.800')}
                            boxShadow={'2xl'}
                            rounded={'md'}
                            overflow={'hidden'}
                        >
                            <Image
                                h={'120px'}
                                w={'full'}
                                src={
                                    'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
                                }
                                objectFit="cover"
                                alt="#"
                            />
                            <Flex justify={'center'} mt={-70}>
                                <Avatar
                                    size='2xl'
                                    src={profile?.avatar_uri ? `${IPFS_URL}${profile?.avatar_uri}` : ''}
                                    css={{border: '2px solid white'}}
                                />
                            </Flex>

                            <Box p={6}>
                                <Stack spacing={0} align={'center'}>
                                    <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
                                        {profile?.name}
                                    </Heading>
                                    <Text color={'gray.500'}>{profile?.bio}</Text>
                                </Stack>

                                <Flex justify={'center'} align={'center'} style={{marginBottom: 5}}>
                                    <CopyButton size={'sm'} str={formatShortAddress(id)} value={id}/>
                                </Flex>


                                <Stack direction={'row'} justify={'center'} spacing={6}>
                                    <Stack spacing={0} align={'center'}>
                                        <Text fontWeight={600}>{profile?.followersCount}</Text>
                                        <Text fontSize={'sm'} color={'gray.500'}>
                                            Followers
                                        </Text>
                                    </Stack>

                                    <Stack spacing={0} align={'center'}>
                                        <Text fontWeight={600}>{totalPosts}</Text>
                                        <Text fontSize={'sm'} color={'gray.500'}>
                                            Posts
                                        </Text>
                                    </Stack>
                                </Stack>

                                {account && account?.address === id
                                    ? <Button
                                        rightIcon={<EditIcon/>}
                                        w={'full'}
                                        mt={8}
                                        bg={useColorModeValue('#151f21', 'gray.900')}
                                        color={'white'}
                                        rounded={'md'}
                                        onClick={() => navigate('/profile/edit')}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    : <Button
                                        w={'full'}
                                        mt={8}
                                        border={'1px solid '}
                                        isLoading={isLoadingFollow || isLoadingFollowStatus}
                                        bg={
                                            isFollowed ? useColorModeValue('#151f21', 'gray.900') : useColorModeValue('#2c3c41', 'gray.900')
                                        }
                                        color={'white'}
                                        rounded={'md'}
                                        onClick={handlerFollow}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}
                                    >
                                        {isFollowed ? <IconCheck/> : 'Follow'}
                                    </Button>
                                }
                            </Box>
                        </Box>
                    </Center>

                    <Tabs defaultIndex={1} variant='soft-rounded' colorScheme='green'>
                        <TabList>
                            <Tab>Followers</Tab>
                            <Tab>Posts</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                {isLoadingFetchFollowers &&
                                    <Flex justify={'center'} align={'center'}>
                                        <Spinner size='lg'/>
                                    </Flex>
                                }

                                {profileFollowers?.length === 0 && !isLoadingFetchFollowers &&
                                    <Alert status='info'>
                                        <Stack>
                                            <Flex>
                                                <AlertIcon/>
                                                <AlertTitle>No followers</AlertTitle>
                                            </Flex>
                                        </Stack>
                                    </Alert>
                                }

                                {profileFollowers?.length !== 0 &&
                                    <Box
                                        w={'full'}
                                        bg={useColorModeValue('white', 'gray.800')}
                                        boxShadow={'2xl'}
                                        rounded={'md'}
                                        p={3}
                                        overflow={'hidden'}
                                    >
                                        <FollowersList followers={profileFollowers}/>
                                    </Box>
                                }
                            </TabPanel>
                            <TabPanel>
                                <PostsList
                                    lastPostIndex={lastPostIndex}
                                    isLoadingPosts={isLoadingPosts}
                                    handlerShowMore={handlerShowMore}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Stack>
            }
        </>
    )
}

export default ProfileInfo