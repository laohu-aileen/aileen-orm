import { Annotation } from "aileen-annotation";
import { ID, ComponentAnnotation } from "aileen-core";
import {
  EntityOptions,
  Entity as BaseEntity,
  EntityRepository as BaseEntityRepository,
  EntitySchema,
} from "typeorm";

// 导出ORM组件
export {
  PrimaryGeneratedColumn,
  Column,
  Repository,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Tree,
  TreeChildren,
  TreeParent,
  TreeRepository,
  TreeLevelColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinTable,
  Connection,
} from "typeorm";

/**
 * 组件ID
 */
export const EntityComponentID = Symbol("EntityComponentID");

// 创建注解
export const EntityAnnotation = new Annotation<EntityOptions>();
EntityAnnotation.warp((option) => <any>BaseEntity(option));
EntityAnnotation.warp(() =>
  ComponentAnnotation.decorator({
    scope: "prototype",
    tags: [EntityComponentID],
  })
);

// 实体注解
export const Entity = (option: EntityOptions = {}): ClassDecorator =>
  EntityAnnotation.decorator(option);

// 创建注解
export const RepositoryAnnotation = new Annotation<{
  id?: ID;
  entity: Function | EntitySchema<any>;
}>();
RepositoryAnnotation.warp((option) => <any>BaseEntityRepository(option.entity));

// 实体仓库关联
const EntityLinkRepoID = Symbol();
export const getEntityRepositoryRef = (
  entity: Function
): {
  id: ID;
  target: Function;
} => entity[EntityLinkRepoID];

// 实体注解
export const EntityRepository = (
  entity: Function | EntitySchema<any>,
  id?: ID
): ClassDecorator => {
  const decorator = RepositoryAnnotation.decorator({ entity, id });
  return (target) => {
    decorator(target);
    entity[EntityLinkRepoID] = {
      id,
      target,
    };
  };
};
