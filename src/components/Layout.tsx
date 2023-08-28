import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    Container,
    Flex,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack,
    useColorMode,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react'
import {CloseIcon, HamburgerIcon, MoonIcon, SearchIcon, SunIcon} from '@chakra-ui/icons'
import {Link, Outlet} from 'react-router-dom'
import {useAccount} from "@/hooks";
import {WalletData} from "./WalletData.tsx";
import {formatShortAddress} from "@/utils/utils.tsx";
import * as contractSoroban from "social-contract";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {Fragment, useEffect} from "react";
import {IPFS_URL} from "@/utils/constants.tsx";
import {IconSearch} from "@tabler/icons-react";
import SearchUserProfile from "@/components/SearchUserProfile.tsx";

type LinkType = { title: string, link: string }

const HeaderLinks: LinkType[] = [{
    title: 'Posts', link: '/posts'
}]

const Layout = () => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const {isOpen: isOpenSearchUserModal, onOpen: onOpenSearchUserModal, onClose: onCloseSearchUserModal} = useDisclosure()
    const {colorMode, toggleColorMode} = useColorMode()
    const {profile, setProfile, setIsLoadingProfile} = useProfileStore()
    const account = useAccount()

    const UserProfileLinks: LinkType[] = [
        {title: 'Profile', link: `/profile/${account?.address}`},
        {title: 'Edit Profile', link: `/profile/edit`},
    ]

    const getMyProfileInfo = async () => {
        setIsLoadingProfile(true)
        try {
            let txUserInfo = await contractSoroban.getUserInfo({
                address: account!.address
            })
            setProfile({...txUserInfo})
            setIsLoadingProfile(false)
        } catch (e) {
            setIsLoadingProfile(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if (account) getMyProfileInfo()
    }, [account]);

    return (
        <>
            <SearchUserProfile isOpen={isOpenSearchUserModal} onClose={onCloseSearchUserModal}/>
            <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
                <Container maxW='xl'>
                    <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                        <IconButton
                            size={'md'}
                            icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
                            aria-label={'Open Menu'}
                            display={{md: 'none'}}
                            onClick={isOpen ? onClose : onOpen}
                        />
                        <HStack spacing={8} alignItems={'center'}>
                            <Box>Logo</Box>
                            <HStack as={'nav'} spacing={4} display={{base: 'none', md: 'flex'}}>
                                {HeaderLinks.map((item) => (
                                    <Link to={item?.link} key={item.link}>{item?.title}</Link>
                                ))}
                            </HStack>
                        </HStack>
                        <Flex alignItems={'center'}>
                            <Button
                                size={'sm'}
                                mr={4}
                                onClick={onOpenSearchUserModal}
                            >
                                <SearchIcon/>
                            </Button>

                            <Button
                                variant={'solid'}
                                colorScheme={'teal'}
                                size={'sm'}
                                mr={4}
                                onClick={toggleColorMode}
                            >
                                {colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
                            </Button>

                            <Card>
                                <WalletData/>
                            </Card>

                            {account &&
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        rounded={'full'}
                                        variant={'link'}
                                        cursor={'pointer'}
                                        minW={0}>
                                        <Avatar
                                            size={'sm'}
                                            src={profile?.avatar_uri ? `${IPFS_URL}${profile?.avatar_uri}` : ''}
                                        />
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem>
                                            <Badge style={{width: '100%', height: '100%'}}>
                                                {formatShortAddress(account?.address)}
                                            </Badge>
                                        </MenuItem>
                                        {UserProfileLinks?.map((item, index) =>
                                            <Fragment key={item.title}>
                                                <MenuItem>
                                                    <Link style={{width: '100%', height: '100%'}} to={item.link}>
                                                        {item.title}
                                                    </Link>
                                                </MenuItem>
                                                {index !== UserProfileLinks?.length - 1 &&
                                                    <MenuDivider/>
                                                }
                                            </Fragment>
                                        )}
                                    </MenuList>
                                </Menu>
                            }
                        </Flex>
                    </Flex>
                </Container>

                {isOpen
                    ? <Box pb={4} display={{md: 'none'}}>
                        <Stack as={'nav'} spacing={4}>
                            {HeaderLinks.map((item) => (
                                <Link to={item?.link} key={item.link}>
                                    {item?.title}
                                </Link>
                            ))}
                        </Stack>
                    </Box>
                    : null
                }
            </Box>
            <Container maxW='xl'>
                <Outlet/>
            </Container>
        </>
    )
}

export default Layout