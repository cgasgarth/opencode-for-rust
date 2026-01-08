pub type UserId = u64;

pub struct Session {
    pub token: String,
    pub expires: u64,
}

pub fn validate_session(session: &Session) -> bool {
    session.expires > 0
}
