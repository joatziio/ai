import {
    StartTranscriptionJobCommand,
    TranscribeClient,
  } from "@aws-sdk/client-transcribe";
  import * as dotenv from "dotenv";
  
  import { paginateListObjectsV2, S3Client } from "@aws-sdk/client-s3";
  dotenv.config();
  
  const awsConfig = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
      secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
    },
    region: "us-east-2",
  };
  
  const s3bucketClient = new S3Client(awsConfig);
  const transcribeClient = new TranscribeClient(awsConfig);
  
  const MP3_BUCKET_NAME = "golden-palm-growers-audio-transcribe";
  
  async function startTranscriptionRequest(file: S3FileType) {
    const transcribeCommand = new StartTranscriptionJobCommand({
      TranscriptionJobName: file.Key,
      Media: { MediaFileUri: `s3://${MP3_BUCKET_NAME}/${file.Key}` },
      OutputBucketName: `${MP3_BUCKET_NAME}-output-v1`,
      IdentifyMultipleLanguages: true,
      Settings: {
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: 5,
      },
    });
    try {
      const transcribeResponse = await transcribeClient.send(transcribeCommand);
      console.log("Transcription job created, the details:");
      console.log(transcribeResponse.TranscriptionJob);
    } catch (err) {
      console.log(err);
    }
  }
  
  interface S3FileType {
    Key: string; //'Bernama Channel - The Breakfast Club interview with Mr Andrew Phang.mp3',
    LastModified: Date; // 2025-04-17T04:12:51.000Z,
    ETag: String; //'"739edf59a578ceec8d94383b77335196"',
    ChecksumAlgorithm: string[]; //[ 'CRC64NVME' ],
    ChecksumType: string; //'FULL_OBJECT',
    Size: number; //11358793,
    StorageClass: string; //'STANDARD'
  }
  
  const main = async () => {
    const mp3Iterator = paginateListObjectsV2(
      { client: s3bucketClient },
      { Bucket: MP3_BUCKET_NAME }
    );
    for await (const mp3 of mp3Iterator) {
      const files = (mp3.Contents ?? []) as S3FileType[];
      for (const file of files) {
        await startTranscriptionRequest(file);
      }
    }
  };
  
  main();
  