import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({ region: process.env.AWS_REGION });

// Crendentials come from the EC2 insance role, or from ~/.aws/credentials locally.
export function signedUrl(key) {
    return getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key}),
        {expiresIn: 3600},
    );
}
