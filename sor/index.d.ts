/**
 * Get the token to access graph API
 */
export function getToken(): Promise<string>
/**
 * Get a file resource by using getItem API
 * @param path
 * @param access_token
 * @param item_id
 */
export function getItem(
  path: string,
  access_token: string,
  item_id?: string,
): Promise<ResourceType | null>
/**
 * Get a folder resource by using listChildren API
 * @param path
 * @param access_token
 * @param item_id
 */
export function listChildren(
  path: string,
  access_token: string,
  item_id?: string,
): Promise<ResourceType | null>

export interface ResourceType {
  audio: Audio
  content: Content
  cTag: string
  deleted: Deleted
  description: string
  file: File
  fileSystemInfo: FileSystemInfo
  folder: Folder
  image: Image
  location: Location
  malware: Malware
  package: Package
  photo: Photo
  publication: Publication
  remoteItem: RemoteItem
  root: Root2
  searchResult: SearchResult
  shared: Shared
  sharepointIds: SharepointIds
  size: number
  specialFolder: SpecialFolder
  video: Video
  webDavUrl: string
  activities: Activity[]
  children: Children[]
  permissions: Permission[]
  thumbnails: Thumbnail[]
  versions: Version[]
  id: string
  createdBy: CreatedBy
  createdDateTime: string
  eTag: string
  lastModifiedBy: LastModifiedBy
  lastModifiedDateTime: string
  name: string
  parentReference: ParentReference
  webUrl: string
  '@microsoft.graph.conflictBehavior': string
  '@microsoft.graph.downloadUrl': string
  '@microsoft.graph.sourceUrl': string
}

export interface Audio {
  '@odata.type': string
}

export interface Content {
  '@odata.type': string
}

export interface Deleted {
  '@odata.type': string
}

export interface File {
  '@odata.type': string
}

export interface FileSystemInfo {
  '@odata.type': string
}

export interface Folder {
  '@odata.type': string
}

export interface Image {
  '@odata.type': string
}

export interface Location {
  '@odata.type': string
}

export interface Malware {
  '@odata.type': string
}

export interface Package {
  '@odata.type': string
}

export interface Photo {
  '@odata.type': string
}

export interface Publication {
  '@odata.type': string
}

export interface RemoteItem {
  '@odata.type': string
}

export interface Root2 {
  '@odata.type': string
}

export interface SearchResult {
  '@odata.type': string
}

export interface Shared {
  '@odata.type': string
}

export interface SharepointIds {
  '@odata.type': string
}

export interface SpecialFolder {
  '@odata.type': string
}

export interface Video {
  '@odata.type': string
}

export interface Activity {
  '@odata.type': string
}

export interface Children {
  '@odata.type': string
}

export interface Permission {
  '@odata.type': string
}

export interface Thumbnail {
  '@odata.type': string
}

export interface Version {
  '@odata.type': string
}

export interface CreatedBy {
  '@odata.type': string
}

export interface LastModifiedBy {
  '@odata.type': string
}

export interface ParentReference {
  '@odata.type': string
}
