-- 001_extensions.sql
-- Extensions dan enum types untuk FitFlow.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.tenant_role as enum ('owner', 'trainer', 'member');
create type public.member_status as enum ('active', 'inactive', 'suspended');
create type public.quota_status as enum ('active', 'expired', 'inactive');
create type public.booking_status as enum (
  'pending',
  'confirmed',
  'rejected',
  'cancelled',
  'checked_in',
  'completed',
  'no_show'
);
create type public.quota_event as enum (
  'grant',
  'adjustment',
  'reservation',
  'release',
  'consumed'
);
