import Head from "next/head";
import { useRouter } from "next/router";
import Portal from "../components/graphics/portal";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/dashboard");
  }, []);

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
            <div>
              <Portal style={{ maxWidth: "100%", height: "auto" }} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
