import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast
} from "@chakra-ui/react"
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {CloseIcon, SearchIcon} from "@chakra-ui/icons";

type SearchUserProfileProps = {
    onClose: any,
    isOpen: boolean
}

const SearchUserProfile = ({onClose, isOpen}: SearchUserProfileProps) => {
    const toast = useToast()
    const navigate = useNavigate()
    const [address, setAddress] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setAddress('')
        }
    }, [isOpen]);

    const handlerSearchUserByAddress = () => {
        if (address?.length !== 0) {
            onClose()
            setAddress('')
            navigate(`/profile/${address}`)
        } else {
            toast({
                title: 'Invalid address!',
                description: "",
                position: 'bottom-right',
                status: 'error',
                duration: 3000,
                isClosable: true,
                variant: 'subtle'
            })
        }
    }

    const handlerCloseModal = () => {
        onClose()
        setAddress('')
    }

    return (
        <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Search user</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Input
                        id="name"
                        placeholder="Name"
                        value={address}
                        onChange={(e: any) => setAddress(e.target?.value)}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button rightIcon={<CloseIcon width={3} height={5}/>} colorScheme='blue' mr={3}
                            onClick={handlerCloseModal}>
                        Close
                    </Button>
                    <Button onClick={handlerSearchUserByAddress} colorScheme={'teal'} variant='ghost'
                            rightIcon={<SearchIcon/>}>Search</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
};

export default SearchUserProfile