use std::{
    backtrace::{Backtrace, BacktraceStatus},
    thread,
};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Error(#[from] Box<dyn std::error::Error>),
    #[error("{0}")]
    Anyhow(String),
}

#[derive(serde::Serialize)]
#[serde(tag = "code", content = "msg")]
#[serde(rename_all = "camelCase")]
enum ErrorKind {
    Io(String),
    Error(String),
    Anyhow(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // serializer.serialize_str(self.to_string().as_ref())
        let msg = self.to_string();
        let error_kind = match self {
            Error::Io(_) => ErrorKind::Io(msg),
            Error::Error(_) => ErrorKind::Error(msg),
            Error::Anyhow(_) => ErrorKind::Anyhow(msg),
        };
        error_kind.serialize(serializer)
    }
}

pub fn panic_hook() {
    std::panic::set_hook(Box::new(move |panic_info| {
        let thread = thread::current();
        let thread_name = thread.name().unwrap_or("<unnamed>");
        let payload = panic_info.payload();

        let payload = if let Some(s) = payload.downcast_ref::<&str>() {
            &**s
        } else if let Some(s) = payload.downcast_ref::<String>() {
            s
        } else {
            &format!("{:?}", payload)
        };

        let location = panic_info
            .location()
            .map(|l| l.to_string())
            .unwrap_or("unknown location".to_string());

        let backtrace = Backtrace::capture();
        let backtrace = if backtrace.status() == BacktraceStatus::Captured {
            &format!("stack backtrace:\n{}", backtrace)
        } else {
            "note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace"
        };

        log::error!(target:"workoss::app::panic","thread '{}' panicked at {}:\n{}\n{}",thread_name,location,payload,backtrace);
    }));
}
