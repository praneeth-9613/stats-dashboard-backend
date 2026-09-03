import deepEqual from "fast-deep-equal";

type FieldMapping<TNew, TOld> = {
    newField: keyof TNew;
    oldField: keyof TOld;
};

export interface ChangedField<TNew = unknown, TOld = unknown> {
    field: keyof TOld;
    oldValue: TOld[keyof TOld];
    newValue: TNew[keyof TNew];
}

export class Comparator<TNew, TOld> {
    constructor(
        private readonly fieldMappings: FieldMapping<TNew, TOld>[],
    ) { }

    getChangedFields(
        newValue: TNew,
        oldValue: TOld,
    ): ChangedField<TNew, TOld>[] {
        return this.fieldMappings
            .filter(({ newField, oldField }) => {
                const newFieldValue: unknown = newValue[newField];
                const oldFieldValue: unknown = oldValue[oldField];

                return !deepEqual(newFieldValue, oldFieldValue);
            })
            .map(({ newField, oldField }) => ({
                field: oldField,
                oldValue: oldValue[oldField],
                newValue: newValue[newField],
            }));
    }
}