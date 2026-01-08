pub struct User {
    pub id: u64,
    pub username: String,
    pub email: String,
}

pub enum Status {
    Active,
    Inactive,
    Suspended(String),
}

pub trait Displayable {
    fn display(&self) -> String;
}

impl Displayable for User {
    fn display(&self) -> String {
        format!("{} ({})", self.username, self.email)
    }
}

pub fn create_user(username: String, email: String) -> User {
    User {
        id: 0,
        username,
        email,
    }
}

pub const MAX_USERS: u32 = 1000;

fn private_helper() {
    println!("This is private");
}
