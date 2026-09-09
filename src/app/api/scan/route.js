export async function POST(request) {
    try {
        const body = await request.json();

        const response = await fetch("http://localhost:5000/scan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return Response.json(data, {
            status: response.status,
        });

    } catch (error) {
        console.error("Scan proxy error:", error);

        return Response.json(
            {
                error: "Could not connect to the scanning service.",
            },
            {
                status: 500,
            }
        );
    }
}