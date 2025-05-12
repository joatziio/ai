import * as dotenv from "dotenv";

import {
  paginateListObjectsV2,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
dotenv.config();

const awsConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
  },
  region: "us-east-2",
};

const s3bucketClient = new S3Client(awsConfig);
const MP3_BUCKET_NAME = "golden-palm-growers-audio-transcribe-output-v1";

interface S3FileType {
  Key: string; //'Bernama Channel - The Breakfast Club interview with Mr Andrew Phang.mp3',
  LastModified: Date; // 2025-04-17T04:12:51.000Z,
  ETag: String; //'"739edf59a578ceec8d94383b77335196"',
  ChecksumAlgorithm: string[]; //[ 'CRC64NVME' ],
  ChecksumType: string; //'FULL_OBJECT',
  Size: number; //11358793,
  StorageClass: string; //'STANDARD'
}

interface TranscribeJson {
  jobName: string; // "Bernama_Channel_502_TV_Advertisement_EN.mp3";
  accountId: string; // "267239535998";
  status: string; // "COMPLETED";
  results: {
    // transcripts: [[Object]];
    // speaker_labels: { segments: [Array]; channel_label: "ch_0"; speakers: 1 };
    // language_codes: [[Object]];
    // items: Object[];
    audio_segments: {
      id: number; // 0,
      transcript: string; // "Invest and soul with Golden Palm Grower Scheme. A unique and rare investment opportunity begins here. Golden Palm Grower Scheme is a sound investment as palm oil prices have gained 7% over the past 20 years and continue to grow steadily. So purchase a right to yield from a quarter acre oil palm plot for just 7.",
      start_time: string; // "4.5",
      end_time: string; // "21.334",
      language_code: string; // "en-US",
      speaker_label: string; // "spk_0",
      items: number[];
    }[];
  };
}

const getMP3JsonFromS3 = async (
  filename: string
): Promise<TranscribeJson | null> => {
  const response = await s3bucketClient.send(
    new GetObjectCommand({
      Bucket: MP3_BUCKET_NAME,
      Key: filename,
    })
  );

  try {
    const jsonStr = await response.Body?.transformToString();
    const json = JSON.parse(jsonStr ?? "");
    return json;
  } catch (error) {
    console.error("error parsing json", error);
    return null;
  }
};

const main = async () => {
  const mp3Iterator = paginateListObjectsV2(
    { client: s3bucketClient },
    { Bucket: MP3_BUCKET_NAME }
  );
  for await (const mp3 of mp3Iterator) {
    const files = (mp3.Contents ?? []) as S3FileType[];
    for (const file of files) {
      const data = await getMP3JsonFromS3(file.Key);
      if (!data || !data.jobName) {
        console.log(`no data for ${file.Key}`);
      } else {
        console.log(data.jobName);
        for (const audio of data.results.audio_segments) {
          console.log(
            audio.start_time,
            ",",
            audio.end_time,
            ",",
            audio.speaker_label,
            ",",
            audio.transcript
          );
        }
      }
    }
  }
};

main();
