import Link from 'next/link';

export const metadata = {
  title: "Interactive Study",
};

export default function InterStudy() {
    return (
        <> 
            <div>
                <h1>Test</h1>
                <p>We are a small team of developers.</p>
                <Link href="/Main_Page">Home</Link>
            </div>
        </>
    );
}