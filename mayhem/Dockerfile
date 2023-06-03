FROM rustlang/rust:nightly as builder

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y build-essential clang-11 llvm-11-tools cmake clang curl binutils-dev libbfd-dev libunwind8-dev libblocksruntime-dev pkg-config libudev-dev libssl-dev && \
    ln -s /usr/bin/llvm-config-11 /usr/bin/llvm-config

RUN rustup component add rust-src
RUN cargo install -f cargo-fuzz

ADD . /sui
WORKDIR /sui

RUN cd ./external-crates/move/move-bytecode-verifier/fuzz/ && cargo +nightly fuzz build

# Move Fuzzers to a clean image
FROM ubuntu:20.04

COPY --from=builder sui/external-crates/move/target/x86_64-unknown-linux-gnu/release/code_unit /
COPY --from=builder sui/external-crates/move/target/x86_64-unknown-linux-gnu/release/compiled_module /
COPY --from=builder sui/external-crates/move/target/x86_64-unknown-linux-gnu/release/mixed /
