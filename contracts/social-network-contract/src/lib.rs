#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

/*
    The value that will be used when initializing the contract.
    This will bump the contract (extend the lifetime of all instance entries) by approximately 30 days
*/
pub(crate) const BUMP_AMOUNT: u32 = 518400;

/*
    This structure represents represents information about an user, 
    such as name, biography and avatar CID (IPFS).
*/
#[derive(Clone, Debug)]
#[contracttype]
pub struct UserInfo {
    pub name: String,
    pub bio: String,
    pub avatar_uri: String,
}

/*
    This structure represents represents information about a post, 
    such as its ID, author, creation date, the text and the CID (IPFS) of the image (if uploaded).
*/
#[derive(Clone, Debug)]
#[contracttype]
pub struct Post {
    pub id: u32,
    pub author: Address,
    pub create_time: u64,
    pub text: String,
    pub content_uri: String,
}


/*
    This structure represents represents information about a post, 
    such as its ID, author, creation date and the text.
*/
#[derive(Clone, Debug)]
#[contracttype]
pub struct Comment {
    pub id: u32,
    pub author: Address,
    pub create_time: u64,
    pub text: String,
}


/*
    Smart contract storage.
    These entities store all the data of this smart contract.
*/
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // Stores the contract initialization status
    Initialized,
    // Stores information about each user
    Users(Address),
    // Stores the number of followers for each user
    UserFollowersCount(Address),
    // Stores
    UserFollowerByNr(Address, u32),
    // Stores
    UserIsFollowedBy(Address, Address),
    // Stores the count of all posts
    PostsCount,
    // Stores information about each post
    Posts(u32),
    // Stores the number of publications for each user
    PostsOfUserCount(Address),
    // Stores
    PostOfUserByNr(Address, u32),
    // Stores the number of likes for each post
    Likes(u32),
    // Stores
    LikeStatus(u32, Address),
    // Stores the number of comments for each post
    PostCommentsCount(u32),
    // Stores
    PostCommentByNr(u32, u32),
}


/*
    Returns information about a specific user.
*/
fn get_user_info(e: &Env, address: &Address) -> UserInfo {
    e.storage()
        .instance()
        .get::<_, UserInfo>(&DataKey::Users(address.clone()))
        .unwrap_or(UserInfo {
            name: String::from_slice(&e, ""),
            bio: String::from_slice(&e, ""),
            avatar_uri: String::from_slice(&e, ""),
        })
}


/*
    Returns the number of followers of a specific user.
*/
fn get_user_followers_count(e: &Env, address: &Address) -> u32 {
    e.storage()
        .instance()
        .get::<_, u32>(&DataKey::UserFollowersCount(address.clone()))
        .unwrap_or(0u32)
}


/*
    Descr
*/
fn get_user_follower_by_nr(e: &Env, address: &Address, nr: &u32) -> Address {
    assert!(
        nr > &0u32 && nr <= &get_user_followers_count(&e.clone(), &address.clone()),
        "Inexistent Follower"
    );
    e.storage()
        .instance()
        .get::<_, Address>(&DataKey::UserFollowerByNr(address.clone(), nr.clone()))
        .expect("Inexistent Follower")
}


/*
    Returns the status of a user's subscription to another user (true or false)
*/
fn get_follow_status(e: &Env, address: Address, follower: Address) -> bool {
    e.storage()
        .instance()
        .get::<_, bool>(&DataKey::UserIsFollowedBy(address.clone(), follower))
        .unwrap_or(false)
}


/*
    Returns the total number of publications
*/
fn get_posts_count(e: &Env) -> u32 {
    let posts_count: u32 = e
        .storage()
        .instance()
        .get(&DataKey::PostsCount)
        .unwrap_or_default();
    posts_count
}


/*
    Returns information about a specific post.
*/
fn get_post(e: &Env, nr: &u32) -> Post {
    assert!(
        nr > &0u32 && nr <= &get_posts_count(&e.clone()),
        "Inexistent Post"
    );

    e.storage()
        .instance()
        .get::<_, Post>(&DataKey::Posts(nr.clone()))
        .expect("Inexistent Post")
}


/*
    Returns the number of posts of a specific user.
*/
fn get_user_post_count(e: &Env, address: &Address) -> u32 {
    e.storage()
        .instance()
        .get::<_, u32>(&DataKey::PostsOfUserCount(address.clone()))
        .unwrap_or(0u32)
}


/*
    Descr
*/
fn get_post_of_user_by_nr(e: &Env, address: &Address, nr: &u32) -> Post {
    assert!(
        nr > &0u32 && nr <= &get_user_post_count(&e.clone(), &address.clone()),
        "Inexistent Post"
    );
    e.storage()
        .instance()
        .get::<_, Post>(&DataKey::PostOfUserByNr(address.clone(), nr.clone()))
        .expect("Inexistent Post")
}


/*
    Returns the number of likes for a specific post
*/
fn get_post_likes(e: &Env, post_nr: &u32) -> u32 {
    assert!(
        post_nr > &0u32 && post_nr <= &get_posts_count(&e.clone()),
        "Inexistent Post"
    );
    e.storage()
        .instance()
        .get::<_, u32>(&DataKey::Likes(post_nr.clone()))
        .unwrap_or(0u32)
}


/*
    Descr
*/
fn get_like_status(e: &Env, post_nr: &u32, address: Address) -> bool {
    assert!(
        post_nr > &0u32 && post_nr <= &get_posts_count(&e.clone()),
        "Inexistent Post"
    );
    e.storage()
        .instance()
        .get::<_, bool>(&DataKey::LikeStatus(post_nr.clone(), address))
        .unwrap_or(false)
}


/*
    Returns the number of comments for a specific post
*/
fn get_post_comments_count(e: &Env, post_nr: &u32) -> u32 {
    assert!(
        post_nr > &0u32 && post_nr <= &get_posts_count(&e.clone()),
        "Inexistent Post"
    );
    e.storage()
        .instance()
        .get::<_, u32>(&DataKey::PostCommentsCount(post_nr.clone()))
        .unwrap_or(0u32)
}


/*
    Descr
*/
fn get_post_comment_by_nr(e: &Env, post_nr: &u32, comment_nr: &u32) -> Comment {
    assert!(
        post_nr > &0u32 && post_nr <= &get_posts_count(&e.clone()),
        "Inexistent Post"
    );
    assert!(
        comment_nr > &0u32 && comment_nr <= &get_post_comments_count(&e.clone(), &post_nr.clone()),
        "Inexistent Comment"
    );
    e.storage()
        .instance()
        .get::<_, Comment>(&DataKey::PostCommentByNr(
            post_nr.clone(),
            comment_nr.clone(),
        ))
        .expect("Inexistent Comment")
}


/*
    Descr
*/
fn set_follower(e: &Env, address: &Address, user_folowers_count: &u32, follower: &Address) {
    e.storage().instance().set(
        &DataKey::UserFollowersCount(address.clone()),
        user_folowers_count,
    );
    e.storage().instance().set(
        &DataKey::UserFollowerByNr(address.clone(), user_folowers_count.clone()),
        follower,
    );
    e.storage().instance().set(
        &DataKey::UserIsFollowedBy(address.clone(), follower.clone()),
        &true,
    );
}


/*
    Descr
*/
fn set_post(e: &Env, post_id: &u32, post: &Post) {
    e.storage()
        .instance()
        .set(&DataKey::Posts(post_id.clone()), post);
}


/*
    Descr
*/
fn set_post_of_user(e: &Env, address: &Address, user_post_count: &u32, post: &Post) {
    e.storage()
        .instance()
        .set(&DataKey::PostsOfUserCount(address.clone()), user_post_count);
    e.storage().instance().set(
        &DataKey::PostOfUserByNr(address.clone(), user_post_count.clone()),
        post,
    );
}


/*
    Descr
*/
fn set_post_comment(e: &Env, post_nr: &u32, comment_nr: &u32, comment: &Comment) {
    e.storage().instance().set(
        &DataKey::PostCommentByNr(post_nr.clone(), comment_nr.clone()),
        comment,
    );
}

#[contract]
pub struct SocialNetworkContract;

#[contractimpl]
impl SocialNetworkContract {
    
    /*
        Descr
    */
    pub fn initialize(e: Env) {
        assert!(
            !e.storage().instance().has(&DataKey::Initialized),
            "Contract already initialized"
        );
        e.storage().instance().set(&DataKey::Initialized, &true);
        e.storage().instance().bump(BUMP_AMOUNT);
    }

    pub fn update_user_info(
        e: Env,
        address: Address,
        name: String,
        bio: String,
        avatar_uri: String,
    ) -> UserInfo {
        address.require_auth();

        let user_info = UserInfo {
            name: name.clone(),
            bio: bio.clone(),
            avatar_uri: avatar_uri.clone(),
        };
        e.storage()
            .instance()
            .set(&DataKey::Users(address.clone()), &user_info);
        user_info
    }

    pub fn follow_user(e: Env, follower: Address, address: Address) -> u32 {
        follower.require_auth();
        assert!(follower != address, "You cannot follow yourself");
        let mut user_followers_count = Self::get_user_followers_count(e.clone(), address.clone());
        user_followers_count += 1u32;
        set_follower(&e, &address, &user_followers_count, &follower);
        user_followers_count
    }


    pub fn add_post(e: Env, address: Address, text: String, content_uri: String) -> Post {
        address.require_auth();

        let mut posts_count = Self::get_posts_count(e.clone());
        posts_count += 1u32;
        e.storage()
            .instance()
            .set(&DataKey::PostsCount, &posts_count);

        let post = Post {
            id: posts_count.clone(),
            author: address.clone(),
            create_time: e.ledger().timestamp(),
            text: text.clone(),
            content_uri: content_uri.clone(),
        };

        set_post(&e, &posts_count, &post);
        let mut user_posts_count = Self::get_user_post_count(e.clone(), address.clone());
        user_posts_count += 1u32;
        set_post_of_user(&e, &address, &user_posts_count, &post);
        post
    }


    pub fn set_or_remove_like(e: Env, address: Address, post_nr: u32) -> u32 {
        address.require_auth();
        assert!(
            post_nr > 0u32 && post_nr <= get_posts_count(&e.clone()),
            "Inexistent post nr"
        );

        let like_status = get_like_status(&e.clone(), &post_nr.clone(), address.clone());
        let mut post_likes = get_post_likes(&e.clone(), &post_nr.clone());
        if like_status == false {
            post_likes += 1u32;
        } else {
            post_likes -= 1u32;
        }

        e.storage().instance().set(
            &DataKey::LikeStatus(post_nr.clone(), address.clone()),
            &!like_status,
        );

        e.storage()
            .instance()
            .set(&DataKey::Likes(post_nr.clone()), &post_likes);
        post_likes
    }

    pub fn add_comment(e: Env, address: Address, post_nr: u32, text: String) -> Comment {
        address.require_auth();

        let mut post_comments_count = Self::get_post_comments_count(e.clone(), post_nr.clone());
        post_comments_count += 1u32;
        e.storage()
            .instance()
            .set(&DataKey::PostCommentsCount(post_nr), &post_comments_count);

        let comment = Comment {
            id: post_comments_count.clone(),
            author: address.clone(),
            create_time: e.ledger().timestamp(),
            text: text.clone(),
        };

        set_post_comment(&e, &post_nr, &post_comments_count, &comment);

        comment
    }

    pub fn get_user_info(e: Env, address: Address) -> UserInfo {
        get_user_info(&e, &address)
    }

    pub fn get_user_followers_count(e: Env, address: Address) -> u32 {
        get_user_followers_count(&e, &address)
    }

    pub fn get_user_follower_by_nr(e: Env, address: Address, nr: u32) -> Address {
        get_user_follower_by_nr(&e, &address, &nr)
    }

    pub fn get_follow_status(e: Env, address: Address, follower: Address) -> bool {
        get_follow_status(&e, address, follower)
    }

    pub fn get_posts_count(e: Env) -> u32 {
        get_posts_count(&e)
    }

    pub fn get_post(e: Env, post_nr: u32) -> Post {
        get_post(&e, &post_nr)
    }

    pub fn get_user_post_count(e: Env, address: Address) -> u32 {
        get_user_post_count(&e, &address)
    }

    pub fn get_post_of_user_by_nr(e: Env, address: Address, nr: u32) -> Post {
        get_post_of_user_by_nr(&e, &address, &nr)
    }

    pub fn get_post_likes(e: Env, post_nr: u32) -> u32 {
        get_post_likes(&e, &post_nr)
    }

    pub fn get_like_status(e: Env, post_nr: u32, address: Address) -> bool {
        get_like_status(&e, &post_nr, address)
    }

    pub fn get_post_comments_count(e: Env, post_nr: u32) -> u32 {
        get_post_comments_count(&e, &post_nr)
    }

    pub fn get_post_comment_by_nr(e: Env, post_nr: u32, comment_nr: u32) -> Comment {
        get_post_comment_by_nr(&e, &post_nr, &comment_nr)
    }
}
