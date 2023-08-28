import {Avatar, Box, Center, Heading, useColorModeValue} from '@chakra-ui/react'
import {Link} from "react-router-dom";
import {UserInfo} from "social-contract";

import {IPFS_URL} from "@/utils/constants.tsx";

type FollowerItemProps = {
    follower: UserInfo & { address: string }
}

const FollowerItem = ({follower}: FollowerItemProps) => {
    return (
        <Center>
            <Box
                maxW={'100px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.900')}
                borderWidth="2px"
                rounded={'lg'}
                textAlign={'center'}
                p={3}
            >
                <Avatar
                    size={'md'}
                    src={follower?.avatar_uri ? `${IPFS_URL}${follower?.avatar_uri}` : ''}
                    pos={'relative'}
                />
                <Heading style={{marginTop: 5}} fontSize={'sm'}>
                    <Link to={`/profile/${follower?.address}`}>
                        {follower?.name}
                    </Link>
                </Heading>
            </Box>
        </Center>
    )
}

export default FollowerItem