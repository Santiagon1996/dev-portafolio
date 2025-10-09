import { Alert, AlertTitle, AlertDescription } from "@components/ui/alert";
import { QueryApiError } from "@shared/errors/QueryApiError";

interface AlertErrorsProps {
    error: unknown;
}

export const AlertErrors = ({ error }: AlertErrorsProps) => {
    if (!error) return null;

    let errorMessage: string | null = null;
    let errorDetails: string | object | undefined = undefined;
    if (error instanceof QueryApiError) {
        errorMessage = error.apiError.error;
        errorDetails = error.apiError.details;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    if (!errorMessage) return null;

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {errorMessage}
                {errorDetails && (
                    <pre className="bg-red-100 p-2 mt-2 rounded text-xs overflow-x-auto">
                        {typeof errorDetails === "string"
                            ? errorDetails
                            : JSON.stringify(errorDetails, null, 2)}
                    </pre>
                )}
            </AlertDescription>
        </Alert>
    );
};