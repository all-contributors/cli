/**
 * Canonical All Contributors contribution type keys.
 */
export type StandardContributionType =
  | 'a11y'
  | 'audio'
  | 'blog'
  | 'bug'
  | 'business'
  | 'code'
  | 'content'
  | 'data'
  | 'design'
  | 'doc'
  | 'eventOrganizing'
  | 'example'
  | 'financial'
  | 'fundingFinding'
  | 'ideas'
  | 'infra'
  | 'maintenance'
  | 'mentoring'
  | 'platform'
  | 'plugin'
  | 'projectManagement'
  | 'promotion'
  | 'question'
  | 'research'
  | 'review'
  | 'security'
  | 'talk'
  | 'test'
  | 'tool'
  | 'translation'
  | 'tutorial'
  | 'userTesting'
  | 'video'

/**
 * Contribution type can be one of the standard keys, or any custom defined contribution key.
 */
export type ContributionType = StandardContributionType | (string & {})

/**
 * Detailed contribution object supporting an optional custom destination URL.
 */
export interface ContributorContribution {
  type: ContributionType
  url?: string
}

/**
 * Contributor entry representing a contributor in the project.
 */
export interface Contributor {
  login?: string
  name: string
  avatar_url: string
  profile: string
  contributions: (ContributionType | ContributorContribution)[]
}

/**
 * Definition for custom contribution types.
 */
export interface ContributionTypeDefinition {
  symbol: string
  description: string
  link?: string
}

/**
 * Supported Git commit message conventions.
 */
export type CommitConvention =
  'angular' | 'atom' | 'ember' | 'eslint' | 'gitmoji' | 'jshint' | (string & {})

/**
 * Supported repository hosting services.
 */
export type RepoType = 'github' | 'gitlab' | (string & {})

/**
 * Configuration options stored in `.all-contributorsrc` or passed to CLI/API.
 */
export interface AllContributorsConfig {
  $schema?: string
  projectName?: string
  projectOwner?: string
  repoType?: RepoType
  repoHost?: string
  files?: string[]
  imageSize?: number
  contributorsPerLine?: number
  contributors?: Contributor[]
  contributorsSortAlphabetically?: boolean
  sortLocale?: string
  docsLocale?: string
  locale?: string
  linkToDocs?: boolean
  docsLinkTemplate?: string
  badgeTemplate?: string
  contributorTemplate?: string
  wrapperTemplate?: string
  commit?: boolean
  commitConvention?: CommitConvention
  commitType?: string
  commitTemplate?: string
  skipCi?: boolean
  linkToUsage?: boolean
  types?: Record<string, ContributionTypeDefinition>
}

/**
 * Adds or updates a contributor in memory without network/disk side-effects.
 */
export function addContributorWithDetails(
  options: AllContributorsConfig,
  contributorData: Contributor,
): Promise<Contributor[]>

/**
 * Generates the updated markdown string containing the formatted contributors table and badge.
 */
export function generate(
  options: AllContributorsConfig,
  contributors: Contributor[],
  fileContent: string,
): string

/**
 * Initializes the contributors list comments in the given file content.
 */
export function initContributorsList(fileContent: string): string

/**
 * Initializes the badge in the given file content.
 */
export function initBadge(fileContent: string): string
